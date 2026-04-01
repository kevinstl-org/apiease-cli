import fs from 'node:fs/promises';
import path from 'node:path';
import { ProjectManagedPathResolver } from './ProjectManagedPathResolver.js';

class ProjectUpgradeApplierService {
  constructor({
    projectManagedPathResolver = new ProjectManagedPathResolver(),
  } = {}) {
    this.projectManagedPathResolver = projectManagedPathResolver;
  }

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
      const projectPath = this.projectManagedPathResolver.resolveManagedPath({
        managedPath,
        rootDirectoryPath: currentProjectDirectoryPath,
      });
      await fs.mkdir(path.dirname(projectPath), { recursive: true });
      await fs.copyFile(
        this.projectManagedPathResolver.resolveManagedPath({
          managedPath,
          rootDirectoryPath: templateDirectoryPath,
        }),
        projectPath,
      );
    }
  }

  async removeManagedPaths({ currentProjectDirectoryPath, managedPaths }) {
    for (const managedPath of managedPaths) {
      await fs.rm(this.projectManagedPathResolver.resolveManagedPath({
        managedPath,
        rootDirectoryPath: currentProjectDirectoryPath,
      }), { force: true });
    }
  }
}

export { ProjectUpgradeApplierService };
