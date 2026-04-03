import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

class TemplateProjectSourceMaterializer {
  constructor({
    fetch = globalThis.fetch,
    fileSystem = fs,
    temporaryDirectoryParentPath = os.tmpdir(),
    userAgent = 'apiease-cli',
  } = {}) {
    this.fetch = fetch;
    this.fileSystem = fileSystem;
    this.temporaryDirectoryParentPath = temporaryDirectoryParentPath;
    this.userAgent = userAgent;
  }

  async materializeTemplateSource(templateSource) {
    if (templateSource.templateDirectoryPath) {
      return {
        cleanup: async () => {},
        templateDirectoryPath: templateSource.templateDirectoryPath,
        templateVersion: null,
      };
    }

    if (templateSource.sourceType !== 'publicRepository') {
      throw new Error(`Unsupported template source type: ${templateSource.sourceType}`);
    }

    return await this.materializePublicRepositoryTemplate(templateSource);
  }

  async materializePublicRepositoryTemplate(templateSource) {
    const templateDirectoryPath = await this.fileSystem.mkdtemp(
      path.join(this.temporaryDirectoryParentPath, 'apiease-template-'),
    );

    try {
      const repositoryApiBaseUrl = this.buildRepositoryApiBaseUrl(templateSource);
      const branchMetadata = await this.fetchJson(
        `${repositoryApiBaseUrl}/branches/${templateSource.repositoryRef}`,
      );
      const commitHash = this.readCommitHash(branchMetadata);
      const treeSha = this.readTreeSha(branchMetadata);
      const templateTree = await this.fetchJson(
        `${repositoryApiBaseUrl}/git/trees/${treeSha}?recursive=1`,
      );

      await this.writeTreeBlobs({
        repositoryApiBaseUrl,
        templateDirectoryPath,
        templateTree,
      });

      return {
        cleanup: async () => {
          await this.removeTemporaryDirectory(templateDirectoryPath);
        },
        templateDirectoryPath,
        templateVersion: {
          type: 'gitCommit',
          value: commitHash,
        },
      };
    } catch (error) {
      await this.removeTemporaryDirectory(templateDirectoryPath);
      throw error;
    }
  }

  buildRepositoryApiBaseUrl(templateSource) {
    return `https://api.github.com/repos/${templateSource.repositoryOwner}/${templateSource.repositoryName}`;
  }

  readCommitHash(branchMetadata) {
    const commitHash = branchMetadata.commit?.sha;
    if (!commitHash) {
      throw new Error('GitHub branch metadata did not include a commit sha.');
    }

    return commitHash;
  }

  readTreeSha(branchMetadata) {
    const treeSha = branchMetadata.commit?.commit?.tree?.sha;
    if (!treeSha) {
      throw new Error('GitHub branch metadata did not include a tree sha.');
    }

    return treeSha;
  }

  async writeTreeBlobs({ repositoryApiBaseUrl, templateDirectoryPath, templateTree }) {
    for (const treeEntry of templateTree.tree ?? []) {
      if (treeEntry.type !== 'blob') {
        continue;
      }

      await this.writeBlobEntry({
        repositoryApiBaseUrl,
        templateDirectoryPath,
        treeEntry,
      });
    }
  }

  async writeBlobEntry({ repositoryApiBaseUrl, templateDirectoryPath, treeEntry }) {
    const blobResponse = await this.fetchJson(`${repositoryApiBaseUrl}/git/blobs/${treeEntry.sha}`);
    const destinationFilePath = path.join(templateDirectoryPath, treeEntry.path);

    await this.fileSystem.mkdir(path.dirname(destinationFilePath), { recursive: true });
    await this.fileSystem.writeFile(
      destinationFilePath,
      Buffer.from((blobResponse.content ?? '').replaceAll('\n', ''), 'base64'),
    );
  }

  async fetchJson(url) {
    const response = await this.fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub template request failed with status ${response.status}: ${url}`);
    }

    return await response.json();
  }

  async removeTemporaryDirectory(templateDirectoryPath) {
    await this.fileSystem.rm(templateDirectoryPath, { force: true, recursive: true });
  }
}

export { TemplateProjectSourceMaterializer };
