import fs from 'node:fs/promises';
import path from 'node:path';

class ProjectUpgradeApplierService {
  async applyUpgradePlan({ currentProjectDirectoryPath, templateDirectoryPath, upgradePlan }) {
    await this.copyManagedPaths({
      currentProjectDirectoryPath,
      managedPaths: [...upgradePlan.addPaths, ...upgradePlan.updatePaths],
      templateDirectoryPath,
    });
    await this.removeManagedPaths({
      currentProjectDirectoryPath,
      managedPaths: upgradePlan.removePaths,
    });
  }

  async copyManagedPaths({ currentProjectDirectoryPath, managedPaths, templateDirectoryPath }) {
    for (const managedPath of managedPaths) {
      const projectPath = path.join(currentProjectDirectoryPath, managedPath);
      await fs.mkdir(path.dirname(projectPath), { recursive: true });
      await fs.copyFile(path.join(templateDirectoryPath, managedPath), projectPath);
    }
  }

  async removeManagedPaths({ currentProjectDirectoryPath, managedPaths }) {
    for (const managedPath of managedPaths) {
      await fs.rm(path.join(currentProjectDirectoryPath, managedPath), { force: true });
    }
  }
}

export { ProjectUpgradeApplierService };
