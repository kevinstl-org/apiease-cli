import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

test('ApiEaseCreateRequestClient should be constructible for package bootstrap usage', async () => {
  // Arrange
  const clientModuleUrl = pathToFileURL(
    path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseCreateRequestClient.js'),
  ).href;
  const { ApiEaseCreateRequestClient } = await import(clientModuleUrl);

  // Act
  const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient();

  // Assert
  assert.ok(apiEaseCreateRequestClient instanceof ApiEaseCreateRequestClient);
});
