import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const templateProjectVersionResolverModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'template', 'TemplateProjectVersionResolver.js'),
).href;

describe('TemplateProjectVersionResolver', () => {
  describe('resolveTemplateVersion', () => {
    it('should resolve the template git commit from the current branch ref', async () => {
      // Arrange
      const { TemplateProjectVersionResolver } = await import(templateProjectVersionResolverModuleUrl);
      const templateProjectVersionResolver = new TemplateProjectVersionResolver();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-template-version-ref-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const commitHash = '0123456789abcdef0123456789abcdef01234567';

      await fs.mkdir(path.join(templateDirectoryPath, '.git', 'refs', 'heads'), { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, '.git', 'HEAD'), 'ref: refs/heads/main\n');
      await fs.writeFile(path.join(templateDirectoryPath, '.git', 'refs', 'heads', 'main'), `${commitHash}\n`);

      // Act
      const templateVersion = await templateProjectVersionResolver.resolveTemplateVersion(templateDirectoryPath);

      // Assert
      assert.deepEqual(templateVersion, {
        type: 'gitCommit',
        value: commitHash,
      });
    });

    it('should resolve the template git commit from a detached head', async () => {
      // Arrange
      const { TemplateProjectVersionResolver } = await import(templateProjectVersionResolverModuleUrl);
      const templateProjectVersionResolver = new TemplateProjectVersionResolver();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-template-version-detached-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const commitHash = 'fedcba9876543210fedcba9876543210fedcba98';

      await fs.mkdir(path.join(templateDirectoryPath, '.git'), { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, '.git', 'HEAD'), `${commitHash}\n`);

      // Act
      const templateVersion = await templateProjectVersionResolver.resolveTemplateVersion(templateDirectoryPath);

      // Assert
      assert.deepEqual(templateVersion, {
        type: 'gitCommit',
        value: commitHash,
      });
    });
  });
});
