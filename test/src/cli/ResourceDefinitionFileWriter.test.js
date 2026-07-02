import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const resourceDefinitionFileWriterModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'ResourceDefinitionFileWriter.js'),
).href;

describe('ResourceDefinitionFileWriter', () => {
  describe('writeResourceDefinition', () => {
    it('should write a formatted resource definition JSON file', async () => {
      // Arrange
      const { ResourceDefinitionFileWriter } = await import(resourceDefinitionFileWriterModuleUrl);
      const writeFileCalls = [];
      const resourceDefinitionFileWriter = new ResourceDefinitionFileWriter({
        fileSystem: {
          async writeFile(filePath, fileContent, encoding) {
            writeFileCalls.push({ filePath, fileContent, encoding });
          },
        },
      });
      const requestDefinition = {
        handle: 'lookup-discount',
        name: 'Lookup discount',
      };

      // Act
      const result = await resourceDefinitionFileWriter.writeResourceDefinition({
        filePath: '/tmp/request.json',
        resourceDefinition: requestDefinition,
      });

      // Assert
      assert.deepEqual(result, { ok: true });
      assert.deepEqual(writeFileCalls, [
        {
          filePath: '/tmp/request.json',
          fileContent: `${JSON.stringify(requestDefinition, null, 2)}\n`,
          encoding: 'utf8',
        },
      ]);
    });

    it('should return a structured failure when the resource definition cannot be written', async () => {
      // Arrange
      const { ResourceDefinitionFileWriter } = await import(resourceDefinitionFileWriterModuleUrl);
      const resourceDefinitionFileWriter = new ResourceDefinitionFileWriter({
        fileSystem: {
          async writeFile() {
            throw new Error('permission denied');
          },
        },
      });

      // Act
      const result = await resourceDefinitionFileWriter.writeResourceDefinition({
        filePath: '/tmp/request.json',
        resourceDefinition: {
          handle: 'lookup-discount',
        },
      });

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'RESOURCE_DEFINITION_FILE_WRITE_FAILED',
        message: 'Resource definition file could not be written: /tmp/request.json',
        fieldErrors: [],
      });
    });
  });
});
