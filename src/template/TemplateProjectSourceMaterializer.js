import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

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
      const commitHash = await this.writePublicRepositoryTemplate({
        templateDirectoryPath,
        templateSource,
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

  async writePublicRepositoryTemplate({ templateDirectoryPath, templateSource }) {
    const commitHash = await this.fetchCommitHashFromPublicFeed(templateSource);
    const tarballResponse = await this.fetchResponse(this.buildPublicArchiveUrl(templateSource, commitHash));
    const tarArchiveBuffer = this.unpackTarArchiveBuffer(await tarballResponse.arrayBuffer());

    await this.writeTarArchiveEntries({
      tarArchiveBuffer,
      templateDirectoryPath,
    });

    return commitHash;
  }

  buildPublicArchiveUrl(templateSource, commitHash) {
    return `https://github.com/${templateSource.repositoryOwner}/${templateSource.repositoryName}/archive/${commitHash}.tar.gz`;
  }

  buildPublicCommitFeedUrl(templateSource) {
    return `https://github.com/${templateSource.repositoryOwner}/${templateSource.repositoryName}/commits/${templateSource.repositoryRef}.atom`;
  }

  async fetchCommitHashFromPublicFeed(templateSource) {
    const commitFeedResponse = await this.fetchResponse(this.buildPublicCommitFeedUrl(templateSource), {
      acceptHeaderValue: 'application/atom+xml',
    });
    const commitFeed = await commitFeedResponse.text();
    const commitHashMatch = commitFeed.match(/Grit::Commit\/([0-9a-f]{40})/i);

    if (!commitHashMatch) {
      throw new Error('GitHub public commit feed did not include a commit sha.');
    }

    return commitHashMatch[1];
  }

  unpackTarArchiveBuffer(compressedArchiveBuffer) {
    return zlib.gunzipSync(Buffer.from(compressedArchiveBuffer));
  }

  async writeTarArchiveEntries({ tarArchiveBuffer, templateDirectoryPath }) {
    let currentOffset = 0;

    while (currentOffset < tarArchiveBuffer.length) {
      const tarHeaderBuffer = tarArchiveBuffer.subarray(currentOffset, currentOffset + 512);
      if (this.isTarArchiveEndBlock(tarHeaderBuffer)) {
        return;
      }

      const tarEntry = this.readTarEntry(tarHeaderBuffer);
      const fileContentStartOffset = currentOffset + 512;
      const fileContentEndOffset = fileContentStartOffset + tarEntry.size;

      if (this.isTarRegularFileEntry(tarEntry)) {
        await this.writeTarRegularFileEntry({
          tarEntry,
          fileContentBuffer: tarArchiveBuffer.subarray(fileContentStartOffset, fileContentEndOffset),
          templateDirectoryPath,
        });
      }

      currentOffset = fileContentStartOffset + this.roundUpTarEntrySize(tarEntry.size);
    }
  }

  isTarArchiveEndBlock(tarHeaderBuffer) {
    return tarHeaderBuffer.every((headerByte) => headerByte === 0);
  }

  readTarEntry(tarHeaderBuffer) {
    const entryName = this.readTarPath(tarHeaderBuffer);
    const sizeText = this.readTarString(tarHeaderBuffer, 124, 12).trim();

    return {
      name: entryName,
      size: sizeText ? Number.parseInt(sizeText, 8) : 0,
      type: this.readTarString(tarHeaderBuffer, 156, 1),
    };
  }

  readTarPath(tarHeaderBuffer) {
    const entryName = this.readTarString(tarHeaderBuffer, 0, 100);
    const entryPrefix = this.readTarString(tarHeaderBuffer, 345, 155);

    return entryPrefix ? `${entryPrefix}/${entryName}` : entryName;
  }

  readTarString(tarHeaderBuffer, startOffset, fieldLength) {
    return tarHeaderBuffer
      .subarray(startOffset, startOffset + fieldLength)
      .toString('utf8')
      .replace(/\0.*$/, '')
      .trim();
  }

  isTarRegularFileEntry(tarEntry) {
    return tarEntry.type === '' || tarEntry.type === '0';
  }

  async writeTarRegularFileEntry({ tarEntry, fileContentBuffer, templateDirectoryPath }) {
    const destinationRelativePath = this.stripArchiveRootDirectory(tarEntry.name);
    if (!destinationRelativePath) {
      return;
    }

    const destinationFilePath = path.join(templateDirectoryPath, destinationRelativePath);
    await this.fileSystem.mkdir(path.dirname(destinationFilePath), { recursive: true });
    await this.fileSystem.writeFile(destinationFilePath, fileContentBuffer);
  }

  stripArchiveRootDirectory(archiveEntryPath) {
    const archivePathSegments = archiveEntryPath.split('/').filter(Boolean);

    if (archivePathSegments.length <= 1) {
      return null;
    }

    return archivePathSegments.slice(1).join('/');
  }

  roundUpTarEntrySize(entrySize) {
    if (entrySize === 0) {
      return 0;
    }

    return Math.ceil(entrySize / 512) * 512;
  }

  async fetchResponse(url, { acceptHeaderValue = 'application/octet-stream' } = {}) {
    const response = await this.fetch(url, {
      headers: {
        Accept: acceptHeaderValue,
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub template request failed with status ${response.status}: ${url}`);
    }

    return response;
  }

  async removeTemporaryDirectory(templateDirectoryPath) {
    await this.fileSystem.rm(templateDirectoryPath, { force: true, recursive: true });
  }
}

export { TemplateProjectSourceMaterializer };
