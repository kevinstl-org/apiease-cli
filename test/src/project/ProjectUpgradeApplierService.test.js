import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const projectUpgradeApplierServiceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'project', 'ProjectUpgradeApplierService.js'),
).href;

describe('ProjectUpgradeApplierService', () => {
  describe('applyUpgradePlan', () => {
    it('should add, update, and remove project files from the current template state', async () => {
      // Arrange
      const { ProjectUpgradeApplierService } = await import(projectUpgradeApplierServiceModuleUrl);
      const projectUpgradeApplierService = new ProjectUpgradeApplierService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-upgrade-apply-'));
      const projectRootPath = path.join(temporaryDirectoryPath, 'project');
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'template');

      await fs.mkdir(path.join(projectRootPath, 'resources', 'requests'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, 'resources', 'requests'), { recursive: true });
      await fs.writeFile(path.join(projectRootPath, 'updated.txt'), 'old content\n');
      await fs.writeFile(path.join(projectRootPath, 'removed.txt'), 'remove me\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'added.txt'), 'added content\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'updated.txt'), 'new content\n');
      await fs.writeFile(
        path.join(templateDirectoryPath, 'resources', 'requests', 'example-request.json'),
        '{\n  "name": "template"\n}\n',
      );

      // Act
      await projectUpgradeApplierService.applyUpgradePlan({
        currentProjectDirectoryPath: projectRootPath,
        templateDirectoryPath,
        upgradePlan: {
          addPaths: ['added.txt', 'resources/requests/example-request.json'],
          removePaths: ['removed.txt'],
          skipPaths: [],
          updatePaths: ['updated.txt'],
        },
      });

      // Assert
      assert.equal(await fs.readFile(path.join(projectRootPath, 'added.txt'), 'utf8'), 'added content\n');
      assert.equal(await fs.readFile(path.join(projectRootPath, 'updated.txt'), 'utf8'), 'new content\n');
      assert.equal(
        await fs.readFile(path.join(projectRootPath, 'resources', 'requests', 'example-request.json'), 'utf8'),
        '{\n  "name": "template"\n}\n',
      );
      await assert.rejects(fs.access(path.join(projectRootPath, 'removed.txt')));
    });

    it('should reject an upgrade plan path that escapes the project root', async () => {
      // Arrange
      const { ProjectUpgradeApplierService } = await import(projectUpgradeApplierServiceModuleUrl);
      const projectUpgradeApplierService = new ProjectUpgradeApplierService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-upgrade-apply-'));
      const projectRootPath = path.join(temporaryDirectoryPath, 'project');
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'template');
      const outsideFilePath = path.join(temporaryDirectoryPath, 'outside.txt');

      await fs.mkdir(projectRootPath, { recursive: true });
      await fs.mkdir(templateDirectoryPath, { recursive: true });
      await fs.writeFile(outsideFilePath, 'outside content\n');

      // Act / Assert
      await assert.rejects(
        projectUpgradeApplierService.applyUpgradePlan({
          currentProjectDirectoryPath: projectRootPath,
          templateDirectoryPath,
          upgradePlan: {
            addPaths: [],
            removePaths: ['../../outside.txt'],
            skipPaths: [],
            updatePaths: [],
          },
        }),
        {
          code: 'APIEASE_INVALID_MANAGED_PATH',
          message: 'Managed template path must stay within the project root: ../../outside.txt',
        },
      );
      assert.equal(await fs.readFile(outsideFilePath, 'utf8'), 'outside content\n');
    });
  });
});
