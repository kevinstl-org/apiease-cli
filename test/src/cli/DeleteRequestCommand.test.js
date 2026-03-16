import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const deleteRequestCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'DeleteRequestCommand.js'),
).href;

describe('DeleteRequestCommand', () => {
  describe('run', () => {
    it('should call the delete client and return zero for human-readable success output', async () => {
      // Arrange
      const { DeleteRequestCommand } = await import(deleteRequestCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const deleteRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const deleteRequestCommand = new DeleteRequestCommand({
        apiEaseDeleteRequestClient: {
          async deleteRequest(options) {
            deleteRequestCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
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
              apiKey: 'home-api-key',
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await deleteRequestCommand.run([
        'delete',
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
      assert.deepEqual(deleteRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          requestId: 'request-1',
        },
      ]);
      assert.equal(resolveConfigurationCallCount, 0);
      assert.match(stdoutChunks.join(''), /Request deleted successfully\./);
      assert.match(stdoutChunks.join(''), /Request ID: request-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should resolve the api key from home configuration when the api key argument is omitted', async () => {
      // Arrange
      const { DeleteRequestCommand } = await import(deleteRequestCommandModuleUrl);
      const deleteRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const deleteRequestCommand = new DeleteRequestCommand({
        apiEaseDeleteRequestClient: {
          async deleteRequest(options) {
            deleteRequestCalls.push(options);
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
      const exitCode = await deleteRequestCommand.run([
        'delete',
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
      assert.deepEqual(deleteRequestCalls, [
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
      const { DeleteRequestCommand } = await import(deleteRequestCommandModuleUrl);
      let deleteRequestCallCount = 0;
      const stderrChunks = [];
      const deleteRequestCommand = new DeleteRequestCommand({
        apiEaseDeleteRequestClient: {
          async deleteRequest() {
            deleteRequestCallCount += 1;
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
      const exitCode = await deleteRequestCommand.run([
        'delete',
        '--request-id',
        'request-1',
        '--base-url',
        'https://apiease.example.com',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(deleteRequestCallCount, 0);
      assert.match(stderrChunks.join(''), /Usage:/);
      assert.match(stderrChunks.join(''), /--shop-domain/);
      assert.doesNotMatch(stderrChunks.join(''), /Missing required arguments: .*--api-key/);
    });

    it('should return non-zero and write raw json when the delete client fails in json mode', async () => {
      // Arrange
      const { DeleteRequestCommand } = await import(deleteRequestCommandModuleUrl);
      const result = {
        status: 404,
        ok: false,
        errorCode: 'REQUEST_NOT_FOUND',
        message: 'Unable to delete request',
        fieldErrors: [],
      };
      const stdoutChunks = [];
      const deleteRequestCommand = new DeleteRequestCommand({
        apiEaseDeleteRequestClient: {
          async deleteRequest() {
            return result;
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await deleteRequestCommand.run([
        'delete',
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
