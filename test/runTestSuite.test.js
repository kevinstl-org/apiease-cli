import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..');

test('run_test_suite.sh should execute npm run test from the project directory', async () => {
  // Arrange
  const runTestSuitePath = path.join(projectDirectoryPath, '.codex', 'run_test_suite.sh');

  // Act
  const runTestSuiteContent = await fs.readFile(runTestSuitePath, 'utf8');

  // Assert
  assert.match(runTestSuiteContent, /npm run test/);
  assert.doesNotMatch(runTestSuiteContent, /Placeholder test suite/);
});
