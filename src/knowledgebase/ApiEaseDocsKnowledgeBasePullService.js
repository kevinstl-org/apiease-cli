import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

class ApiEaseDocsKnowledgeBasePullService {
  constructor({
    sourcePath = null,
    sourcePathCandidates = resolveDefaultSourcePathCandidates(),
    targetPath = resolveDefaultTargetPath(),
    fileSystem = fs,
  } = {}) {
    this.sourcePath = sourcePath;
    this.sourcePathCandidates = sourcePathCandidates;
    this.targetPath = targetPath;
    this.fileSystem = fileSystem;
  }

  async pullApiEaseDocsKnowledgeBase({ check = false } = {}) {
    const { sourceBuffer, sourcePath } = await this.readSourceBuffer();

    if (check) {
      const targetBuffer = await this.readRequiredTargetBuffer();

      if (!sourceBuffer.equals(targetBuffer)) {
        throw new Error(`Knowledge base target is out of date: ${this.targetPath}`);
      }

      return {
        sourcePath,
        targetPath: this.targetPath,
      };
    }

    await this.fileSystem.mkdir(path.dirname(this.targetPath), { recursive: true });
    await this.fileSystem.writeFile(this.targetPath, sourceBuffer);

    return {
      sourcePath,
      targetPath: this.targetPath,
    };
  }

  async readSourceBuffer() {
    for (const sourcePathCandidate of this.resolveSourcePathCandidates()) {
      try {
        return {
          sourcePath: sourcePathCandidate,
          sourceBuffer: await this.fileSystem.readFile(sourcePathCandidate),
        };
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    throw new Error(
      `Missing knowledge base source: ${this.resolveSourcePathCandidates().join(' or ')}`,
    );
  }

  async readRequiredTargetBuffer() {
    try {
      return await this.fileSystem.readFile(this.targetPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Missing knowledge base target: ${this.targetPath}`);
      }

      throw error;
    }
  }

  resolveSourcePathCandidates() {
    if (typeof this.sourcePath === 'string' && this.sourcePath.length > 0) {
      return [this.sourcePath];
    }

    return this.sourcePathCandidates;
  }
}

function resolveDefaultSourcePathCandidates() {
  const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.resolve(
      currentDirectoryPath,
      '..',
      '..',
      '..',
      'apiease-docs',
      'docs',
      'apiEaseDocsConsolidated.md',
    ),
    path.resolve(
      currentDirectoryPath,
      '..',
      '..',
      '..',
      'apiease-docs',
      'knowledgebase',
      'apiEaseDocsConsolidated.md',
    ),
  ];
}

function resolveDefaultTargetPath() {
  const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(
    currentDirectoryPath,
    '..',
    '..',
    'docs',
    'knowledgebase',
    'apiEaseDocsConsolidated.md',
  );
}

export { ApiEaseDocsKnowledgeBasePullService };
