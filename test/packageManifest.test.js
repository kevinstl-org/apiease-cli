import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..');

test('package manifest configures the apiease-cli package as an ES module', async () => {
  // Arrange
  const packageJsonPath = path.join(projectDirectoryPath, 'package.json');

  // Act
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Assert
  assert.equal(packageJson.name, 'apiease-cli');
  assert.equal(packageJson.type, 'module');
});

test('package root exports the canonical create-request client', async () => {
  // Arrange
  const packageRootUrl = pathToFileURL(path.join(projectDirectoryPath, 'src', 'index.js')).href;

  // Act
  const packageRootModule = await import(packageRootUrl);

  // Assert
  assert.equal(typeof packageRootModule.ApiEaseCreateRequestClient, 'function');
});

test('package manifest exposes the bash wrapper as the apiease-cli bin command', async () => {
  // Arrange
  const packageJsonPath = path.join(projectDirectoryPath, 'package.json');

  // Act
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Assert
  assert.equal(packageJson.bin['apiease-cli'], './bin/apiease-cli');
});
