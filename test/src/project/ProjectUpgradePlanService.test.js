import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const projectUpgradePlanServiceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'project', 'ProjectUpgradePlanService.js'),
).href;

describe('ProjectUpgradePlanService', () => {
  describe('buildUpgradePlan', () => {
    it('should classify add, update, remove, and skip paths from template and project state', async () => {
      // Arrange
      const { ProjectUpgradePlanService } = await import(projectUpgradePlanServiceModuleUrl);
      const projectUpgradePlanService = new ProjectUpgradePlanService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-upgrade-plan-'));
      const projectRootPath = path.join(temporaryDirectoryPath, 'project');

      await fs.mkdir(path.join(projectRootPath, 'resources'), { recursive: true });
      await fs.writeFile(path.join(projectRootPath, 'updated.txt'), 'old template version\n');
      await fs.writeFile(path.join(projectRootPath, 'removed.txt'), 'remove me\n');
      await fs.writeFile(path.join(projectRootPath, 'conflict.txt'), 'user modified\n');
      await fs.writeFile(path.join(projectRootPath, 'existing-custom.txt'), 'custom file\n');

      const storedTemplateManifest = {
        'updated.txt': projectUpgradePlanService.buildContentHash('old template version\n'),
        'removed.txt': projectUpgradePlanService.buildContentHash('remove me\n'),
        'conflict.txt': projectUpgradePlanService.buildContentHash('old conflict content\n'),
      };
      const currentTemplateManifest = {
        'added.txt': projectUpgradePlanService.buildContentHash('brand new file\n'),
        'updated.txt': projectUpgradePlanService.buildContentHash('new template version\n'),
        'conflict.txt': projectUpgradePlanService.buildContentHash('new conflict content\n'),
        'existing-custom.txt': projectUpgradePlanService.buildContentHash('new template file\n'),
      };

      // Act
      const plan = await projectUpgradePlanService.buildUpgradePlan({
        currentProjectDirectoryPath: projectRootPath,
        currentTemplateManifest,
        storedTemplateManifest,
      });

      // Assert
      assert.deepEqual(plan, {
        addPaths: ['added.txt'],
        removePaths: ['removed.txt'],
        skipPaths: ['conflict.txt', 'existing-custom.txt'],
        updatePaths: ['updated.txt'],
      });
    });
  });
});
