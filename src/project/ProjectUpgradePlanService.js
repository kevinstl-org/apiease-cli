import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

class ProjectUpgradePlanService {
  async buildUpgradePlan({
    currentProjectDirectoryPath,
    currentTemplateManifest,
    storedTemplateManifest,
  }) {
    const addPaths = [];
    const removePaths = [];
    const skipPaths = [];
    const updatePaths = [];
    const managedPaths = new Set([
      ...Object.keys(currentTemplateManifest),
      ...Object.keys(storedTemplateManifest),
    ]);

    for (const managedPath of [...managedPaths].sort()) {
      const currentTemplateHash = currentTemplateManifest[managedPath];
      const storedTemplateHash = storedTemplateManifest[managedPath];
      const currentProjectFileHash = await this.readProjectFileHash(currentProjectDirectoryPath, managedPath);

      if (!storedTemplateHash && currentTemplateHash) {
        if (!currentProjectFileHash) {
          addPaths.push(managedPath);
          continue;
        }

        if (currentProjectFileHash !== currentTemplateHash) {
          skipPaths.push(managedPath);
        }

        continue;
      }

      if (storedTemplateHash && !currentTemplateHash) {
        if (currentProjectFileHash === storedTemplateHash) {
          removePaths.push(managedPath);
          continue;
        }

        if (currentProjectFileHash) {
          skipPaths.push(managedPath);
        }

        continue;
      }

      if (!currentProjectFileHash) {
        addPaths.push(managedPath);
        continue;
      }

      if (storedTemplateHash === currentTemplateHash) {
        continue;
      }

      if (currentProjectFileHash === currentTemplateHash) {
        continue;
      }

      if (currentProjectFileHash === storedTemplateHash) {
        updatePaths.push(managedPath);
        continue;
      }

      skipPaths.push(managedPath);
    }

    return {
      addPaths,
      removePaths,
      skipPaths,
      updatePaths,
    };
  }

  async readProjectFileHash(currentProjectDirectoryPath, managedPath) {
    try {
      const fileBuffer = await fs.readFile(path.join(currentProjectDirectoryPath, managedPath));
      return this.buildContentHash(fileBuffer);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  }

  buildContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

export { ProjectUpgradePlanService };
