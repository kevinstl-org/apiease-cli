import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const createRequestCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'CreateRequestCommand.js'),
).href;

describe('CreateRequestCommand', () => {
  describe('run', () => {
    it('should load the request file, call the create client, and return zero for human-readable success output', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Create product',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/products',
      };
      const stdoutChunks = [];
      const stderrChunks = [];
      const loadRequestDefinitionCalls = [];
      const createRequestCalls = [];
      const requestDefinitionFileLoader = {
        async loadRequestDefinition(filePath) {
          loadRequestDefinitionCalls.push(filePath);
          return {
            ok: true,
            requestDefinition,
          };
        },
      };
      const apiEaseCreateRequestClient = {
        async createRequest(options) {
          createRequestCalls.push(options);
          return {
            status: 201,
            ok: true,
            shopDomain: 'cool-shop.myshopify.com',
            request: {
              id: 'request-1',
              ...requestDefinition,
            },
          };
        },
      };
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader,
        apiEaseCreateRequestClient,
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(loadRequestDefinitionCalls, ['/tmp/request.json']);
      assert.deepEqual(createRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          request: requestDefinition,
        },
      ]);
      assert.match(stdoutChunks.join(''), /Request created successfully\./);
      assert.match(stdoutChunks.join(''), /request-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should write raw json output and return zero when the json flag is provided', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const result = {
        status: 201,
        ok: true,
        shopDomain: 'cool-shop.myshopify.com',
        request: {
          id: 'request-1',
          type: 'http',
        },
      };
      const stdoutChunks = [];
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition: {
                type: 'http',
              },
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest() {
            return result;
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
        '--json',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(JSON.parse(stdoutChunks.join('')), result);
    });

    it('should fail fast with usage output and no delegated calls when required arguments are missing', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let createRequestCallCount = 0;
      const stderrChunks = [];
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            loadRequestDefinitionCallCount += 1;
            return {
              ok: true,
              requestDefinition: {},
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest() {
            createRequestCallCount += 1;
            return {
              status: 201,
              ok: true,
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(createRequestCallCount, 0);
      assert.match(stderrChunks.join(''), /Usage:/);
      assert.match(stderrChunks.join(''), /--shop-domain/);
      assert.match(stderrChunks.join(''), /--api-key/);
    });

    it('should return non-zero and write raw json when the create client fails in json mode', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const result = {
        status: 422,
        ok: false,
        errorCode: 'INVALID_REQUEST_CREATE_CONTRACT',
        message: 'Request create payload is invalid',
        fieldErrors: [
          {
            path: 'type',
            code: 'REQUIRED',
            message: 'Field is required',
          },
        ],
      };
      const stdoutChunks = [];
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition: {},
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest() {
            return result;
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        '--file',
        '/tmp/request.json',
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
