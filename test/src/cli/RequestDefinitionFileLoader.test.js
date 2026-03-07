import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const requestDefinitionFileLoaderModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'RequestDefinitionFileLoader.js'),
).href;

describe('RequestDefinitionFileLoader', () => {
  let temporaryDirectoryPath;

  before(async () => {
    temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-cli-request-loader-'));
  });

  after(async () => {
    await fs.rm(temporaryDirectoryPath, { recursive: true, force: true });
  });

  describe('loadRequestDefinition', () => {
    it('should load a request definition object from a valid json file', async () => {
      // Arrange
      const { RequestDefinitionFileLoader } = await import(requestDefinitionFileLoaderModuleUrl);
      const requestDefinitionFileLoader = new RequestDefinitionFileLoader();
      const filePath = path.join(temporaryDirectoryPath, 'valid-request.json');
      const requestDefinition = {
        name: 'Create customer',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/customers',
      };
      await fs.writeFile(filePath, JSON.stringify(requestDefinition), 'utf8');

      // Act
      const result = await requestDefinitionFileLoader.loadRequestDefinition(filePath);

      // Assert
      assert.deepEqual(result, {
        ok: true,
        requestDefinition,
      });
    });

    it('should return a structured error when the file is missing', async () => {
      // Arrange
      const { RequestDefinitionFileLoader } = await import(requestDefinitionFileLoaderModuleUrl);
      const requestDefinitionFileLoader = new RequestDefinitionFileLoader();
      const filePath = path.join(temporaryDirectoryPath, 'missing-request.json');

      // Act
      const result = await requestDefinitionFileLoader.loadRequestDefinition(filePath);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'REQUEST_DEFINITION_FILE_NOT_FOUND',
        message: `Request definition file was not found: ${filePath}`,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the file cannot be read', async () => {
      // Arrange
      const { RequestDefinitionFileLoader } = await import(requestDefinitionFileLoaderModuleUrl);
      const requestDefinitionFileLoader = new RequestDefinitionFileLoader();
      const filePath = path.join(temporaryDirectoryPath, 'unreadable-request.json');
      await fs.mkdir(filePath);

      // Act
      const result = await requestDefinitionFileLoader.loadRequestDefinition(filePath);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'REQUEST_DEFINITION_FILE_READ_FAILED',
        message: `Request definition file could not be read: ${filePath}`,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the file contains invalid json', async () => {
      // Arrange
      const { RequestDefinitionFileLoader } = await import(requestDefinitionFileLoaderModuleUrl);
      const requestDefinitionFileLoader = new RequestDefinitionFileLoader();
      const filePath = path.join(temporaryDirectoryPath, 'invalid-request.json');
      await fs.writeFile(filePath, '{ "type": "http", }', 'utf8');

      // Act
      const result = await requestDefinitionFileLoader.loadRequestDefinition(filePath);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'REQUEST_DEFINITION_FILE_INVALID_JSON',
        message: `Request definition file contains invalid JSON: ${filePath}`,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the json root value is not an object', async () => {
      // Arrange
      const { RequestDefinitionFileLoader } = await import(requestDefinitionFileLoaderModuleUrl);
      const requestDefinitionFileLoader = new RequestDefinitionFileLoader();
      const filePath = path.join(temporaryDirectoryPath, 'request-array.json');
      await fs.writeFile(filePath, JSON.stringify([{ type: 'http' }]), 'utf8');

      // Act
      const result = await requestDefinitionFileLoader.loadRequestDefinition(filePath);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'REQUEST_DEFINITION_FILE_INVALID_ROOT',
        message: `Request definition file must contain a JSON object: ${filePath}`,
        fieldErrors: [],
      });
    });
  });
});
