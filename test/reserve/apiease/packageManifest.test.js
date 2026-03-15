import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

describe('reserve apiease package manifest', () => {
  describe('metadata', () => {
    it('should define the reserved apiease placeholder package', async () => {
      // Arrange
      const packageJson = await readReservePackageJson();

      // Assert
      assert.equal(packageJson.name, 'apiease');
      assert.equal(packageJson.version, '0.0.1');
      assert.match(packageJson.description, /reserved/i);
      assert.match(packageJson.description, /APIEase|APIEase/i);
    });
  });

  describe('publication boundaries', () => {
    it('should not expose a bin command', async () => {
      // Arrange
      const packageJson = await readReservePackageJson();

      // Assert
      assert.equal('bin' in packageJson, false);
    });

    it('should not depend on the main cli implementation', async () => {
      // Arrange
      const packageJson = await readReservePackageJson();

      // Assert
      assert.equal('dependencies' in packageJson, false);
    });
  });
});

async function readReservePackageJson() {
  const packageJsonPath = path.join(projectDirectoryPath, 'reserve', 'apiease', 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');

  return JSON.parse(packageJsonContent);
}
