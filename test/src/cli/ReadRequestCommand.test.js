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
        'request',
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

    it('should call the shared resource read client for variable resources and return zero for human-readable success output', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const readResourceCalls = [];
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest() {
            throw new Error('request read client should not be used for variable resources');
          },
        },
        apiEaseCrudResourceClient: {
          async readResource(options) {
            readResourceCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              variable: {
                name: 'sale_banner',
                value: 'Spring sale',
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'variable',
        '--variable-name',
        'sale_banner',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(readResourceCalls, [
        {
          resourceName: 'variable',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resourceIdentifier: 'sale_banner',
          failureErrorCode: 'VARIABLE_READ_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Variable read successfully\./);
      assert.match(stdoutChunks.join(''), /Variable Name: sale_banner/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should call the shared resource read client for widget resources and return zero for human-readable success output', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const readResourceCalls = [];
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest() {
            throw new Error('request read client should not be used for widget resources');
          },
        },
        apiEaseCrudResourceClient: {
          async readResource(options) {
            readResourceCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              widget: {
                widgetId: 'widget-1',
                title: 'Promo banner',
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'widget',
        '--widget-id',
        'widget-1',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(readResourceCalls, [
        {
          resourceName: 'widget',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resourceIdentifier: 'widget-1',
          failureErrorCode: 'WIDGET_READ_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Widget read successfully\./);
      assert.match(stdoutChunks.join(''), /Widget ID: widget-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should call the shared resource read client for function resources and return zero for human-readable success output', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const readResourceCalls = [];
      const readRequestCommand = new ReadRequestCommand({
        apiEaseReadRequestClient: {
          async readRequest() {
            throw new Error('request read client should not be used for function resources');
          },
        },
        apiEaseCrudResourceClient: {
          async readResource(options) {
            readResourceCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              function: {
                functionId: 'function-1',
                name: 'Calculate discounts',
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'function',
        '--function-id',
        'function-1',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(readResourceCalls, [
        {
          resourceName: 'function',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resourceIdentifier: 'function-1',
          failureErrorCode: 'FUNCTION_READ_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Function read successfully\./);
      assert.match(stdoutChunks.join(''), /Function ID: function-1/);
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
          async resolveEnvironmentVariables() {
            resolveConfigurationCallCount += 1;
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {
                APIEASE_API_KEY: 'resolved-home-api-key',
              },
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'request',
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

    it('should resolve the base url and shop domain from home env variables when those arguments are omitted', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      const readRequestCalls = [];
      let resolveEnvironmentVariablesCallCount = 0;
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
          async resolveEnvironmentVariables() {
            resolveEnvironmentVariablesCallCount += 1;
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {
                APIEASE_BASE_URL: 'https://apiease.example.com/from-home',
                APIEASE_SHOP_DOMAIN: 'home-shop.myshopify.com',
              },
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'request',
        '--request-id',
        'request-1',
        '--api-key',
        'explicit-api-key',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveEnvironmentVariablesCallCount, 1);
      assert.deepEqual(readRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com/from-home',
          apiKey: 'explicit-api-key',
          shopDomain: 'home-shop.myshopify.com',
          requestId: 'request-1',
        },
      ]);
    });

    it('should fail fast with usage output when the resource argument is missing', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      let readRequestCallCount = 0;
      let readResourceCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async readResource() {
            readResourceCallCount += 1;
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
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(readRequestCallCount, 0);
      assert.equal(readResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required resource argument\./);
      assert.match(stderrChunks.join(''), /Usage: apiease read <request\|widget\|variable\|function>/);
    });

    it('should fail fast with usage output when the resource argument is unsupported', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      let readRequestCallCount = 0;
      let readResourceCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async readResource() {
            readResourceCallCount += 1;
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
        'product',
        '--request-id',
        'request-1',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(readRequestCallCount, 0);
      assert.equal(readResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Unsupported resource: product\./);
      assert.match(stderrChunks.join(''), /Usage: apiease read <request\|widget\|variable\|function>/);
    });

    it('should fail fast with usage output when the selected resource identifier flag is missing', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      let readRequestCallCount = 0;
      let readResourceCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async readResource() {
            readResourceCallCount += 1;
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
        'widget',
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
      assert.equal(exitCode, 1);
      assert.equal(readRequestCallCount, 0);
      assert.equal(readResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required arguments: --widget-id/);
      assert.match(stderrChunks.join(''), /Usage: apiease read widget --widget-id <id>/);
    });

    it('should fail fast with usage output when the function identifier flag is missing', async () => {
      // Arrange
      const { ReadRequestCommand } = await import(readRequestCommandModuleUrl);
      let readRequestCallCount = 0;
      let readResourceCallCount = 0;
      let resolveConfigurationCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async readResource() {
            readResourceCallCount += 1;
            return {
              status: 200,
              ok: true,
            };
          },
        },
        apiEaseCommandConfigurationResolver: {
          async resolveConfiguration() {
            resolveConfigurationCallCount += 1;
            return {
              ok: true,
              apiBaseUrl: 'https://apiease.example.com',
              apiKey: 'api-key-1',
              shopDomain: 'cool-shop.myshopify.com',
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'function',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(readRequestCallCount, 0);
      assert.equal(readResourceCallCount, 0);
      assert.equal(resolveConfigurationCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required arguments: --function-id/);
      assert.match(stderrChunks.join(''), /Usage: apiease read function --function-id <id>/);
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
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {
                APIEASE_API_KEY: 'resolved-home-api-key',
              },
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await readRequestCommand.run([
        'read',
        'request',
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
        'request',
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
