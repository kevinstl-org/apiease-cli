import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const readRequestCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'ReadRequestCommand.js'),
).href;

describe('ReadRequestCommand', () => {
  describe('run', () => {
    it('should call the read client and return zero for human-readable success output', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const readRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest(options) {
            readRequestCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              request: {
                id: 'request-1',
                name: 'Create product',
                type: 'http',
                method: 'POST',
                address: 'https://api.example.com/products',
              },
            };
          },
        },
        apiEaseHomeConfigurationResolver: {
          async resolveConfiguration() {
            resolveConfigurationCallCount += 1;
            return {
              ok: true,
              apiKey: 'home-api-key',
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        '--request-id',
        'request-1',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(readRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          requestId: 'request-1',
        },
      ]);
      assert.equal(resolveConfigurationCallCount, 0);
      assert.match(stdoutChunks.join(''), /Request read successfully\./);
      assert.match(stdoutChunks.join(''), /Request ID: request-1/);
      assert.match(stdoutChunks.join(''), /Name: Create product/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should resolve the api key from home configuration when the api key argument is omitted', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const readRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest(options) {
            readRequestCalls.push(options);
            return {
              status: 200,
              ok: true,
              request: {
                id: 'request-1',
              },
            };
          },
        },
        apiEaseHomeConfigurationResolver: {
          async resolveConfiguration() {
            resolveConfigurationCallCount += 1;
            return {
              ok: true,
              environment: 'staging',
              apiKey: 'resolved-home-api-key',
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        '--request-id',
        'request-1',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveConfigurationCallCount, 1);
      assert.deepEqual(readRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'resolved-home-api-key',
          shopDomain: 'cool-shop.myshopify.com',
          requestId: 'request-1',
        },
      ]);
    });

    it('should fail fast with usage output and no delegated calls when required arguments are missing', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      let readRequestCallCount = 0;
      const stderrChunks = [];
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest() {
            readRequestCallCount += 1;
            return {
              status: 200,
              ok: true,
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        '--request-id',
        'request-1',
        '--base-url',
        'https://apiease.example.com',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(readRequestCallCount, 0);
      assert.match(stderrChunks.join(''), /Usage:/);
      assert.match(stderrChunks.join(''), /--shop-domain/);
      assert.doesNotMatch(stderrChunks.join(''), /Missing required arguments: .*--api-key/);
    });

    it('should return non-zero and write raw json when the read client fails in json mode', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const result = {
        status: 404,
        ok: false,
        errorCode: 'REQUEST_NOT_FOUND',
        message: 'Unable to read request',
        fieldErrors: [],
      };
      const stdoutChunks = [];
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest() {
            return result;
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        '--request-id',
        'missing-request',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
        '--json',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.deepEqual(JSON.parse(stdoutChunks.join('')), result);
    });
  });
});

function createWritableStream(chunks) {
  return {
    write(value) {
      chunks.push(value);
      return true;
    },
  };
}
