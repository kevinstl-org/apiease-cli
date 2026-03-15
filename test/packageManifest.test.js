import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..');

describe('package manifest', () => {
  describe('metadata', () => {
    it('should configure the apiease-cli package as an ES module', async () => {
      // Arrange
      const packageJson = await readPackageJson();

      // Assert
      assert.equal(packageJson.name, 'apiease-cli');
      assert.equal(packageJson.type, 'module');
    });
  });

  describe('exports', () => {
    it('should expose the canonical create-request client from the package root', async () => {
      // Arrange
      const packageRootUrl = pathToFileURL(path.join(projectDirectoryPath, 'src', 'index.js')).href;

      // Act
      const packageRootModule = await import(packageRootUrl);

      // Assert
      assert.equal(typeof packageRootModule.ApiEaseCreateRequestClient, 'function');
    });
  });

  describe('bin', () => {
    it('should expose the bash wrapper as the apiease public command', async () => {
      // Arrange
      const packageJson = await readPackageJson();

      // Assert
      assert.equal(packageJson.bin.apiease, './bin/apiease-cli');
    });

    it('should not advertise the legacy apiease-cli bin command', async () => {
      // Arrange
      const packageJson = await readPackageJson();

      // Assert
      assert.equal('apiease-cli' in packageJson.bin, false);
    });
  });
});

async function readPackageJson() {
  const packageJsonPath = path.join(projectDirectoryPath, 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');

  return JSON.parse(packageJsonContent);
}
