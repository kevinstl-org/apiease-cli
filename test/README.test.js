import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..');
const readmeFilePath = path.join(projectDirectoryPath, 'README.md');

describe('README', () => {
  describe('CRUD resource documentation', () => {
    it('should list function in the top-level command reference', async () => {
      // Arrange
      const readme = await fs.readFile(readmeFilePath, 'utf8');

      // Act
      const commandSection = readme;

      // Assert
      assert.match(commandSection, /apiease create <request\|widget\|variable\|function> --file <path>/);
      assert.match(commandSection, /apiease read function --function-id <id>/);
      assert.match(commandSection, /apiease update function --function-id <id> --file <path>/);
      assert.match(commandSection, /apiease delete function --function-id <id>/);
    });

    it('should describe function in the supported resource guidance', async () => {
      // Arrange
      const readme = await fs.readFile(readmeFilePath, 'utf8');

      // Act
      const resourceGuidanceSection = readme;

      // Assert
      assert.match(resourceGuidanceSection, /Supported resource names are `request`, `widget`, `variable`, and `function`\./);
      assert.match(resourceGuidanceSection, /Use `--request-id` for `request`, `--widget-id` for `widget`, `--variable-name` for `variable`, and `--function-id` for `function`\./);
    });

    it('should include function examples for each CRUD verb', async () => {
      // Arrange
      const readme = await fs.readFile(readmeFilePath, 'utf8');

      // Act
      const exampleSection = readme;

      // Assert
      assert.match(exampleSection, /apiease create function \\\n  --file \.\/function-definition\.json/);
      assert.match(exampleSection, /apiease read function --function-id function-123/);
      assert.match(exampleSection, /apiease update function --function-id function-123 --file \.\/function-definition\.json/);
      assert.match(exampleSection, /apiease delete function --function-id function-123/);
    });
  });
});
