import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const EXCLUDED_DIRECTORY_NAMES = new Set(['.git', '.idea', 'node_modules']);

class TemplateProjectManifestBuilder {
  async buildTemplateManifest(templateDirectoryPath) {
    const manifest = {};
    await this.collectManifestEntries({
      currentDirectoryPath: templateDirectoryPath,
      manifest,
      rootDirectoryPath: templateDirectoryPath,
    });
    return manifest;
  }

  async collectManifestEntries({ currentDirectoryPath, manifest, rootDirectoryPath }) {
    const directoryEntries = await fs.readdir(currentDirectoryPath, { withFileTypes: true });

    for (const directoryEntry of directoryEntries) {
      if (EXCLUDED_DIRECTORY_NAMES.has(directoryEntry.name)) {
        continue;
      }

      const entryPath = path.join(currentDirectoryPath, directoryEntry.name);

      if (directoryEntry.isDirectory()) {
        await this.collectManifestEntries({
          currentDirectoryPath: entryPath,
          manifest,
          rootDirectoryPath,
        });
        continue;
      }

      if (directoryEntry.isFile()) {
        manifest[this.buildRelativePath(rootDirectoryPath, entryPath)] = this.buildContentHash(
          await fs.readFile(entryPath),
        );
      }
    }
  }

  buildRelativePath(rootDirectoryPath, entryPath) {
    return path.relative(rootDirectoryPath, entryPath).split(path.sep).join('/');
  }

  buildContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

export { TemplateProjectManifestBuilder };
