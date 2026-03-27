import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const updateRequestCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'UpdateRequestCommand.js'),
).href;

describe('UpdateRequestCommand', () => {
  describe('run', () => {
    it('should load the request file, call the update client, and return zero for human-readable success output', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Update product',
        type: 'http',
        method: 'PUT',
        address: 'https://api.example.com/products/1',
      };
      const stdoutChunks = [];
      const stderrChunks = [];
      const loadRequestDefinitionCalls = [];
      const updateRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition(filePath) {
            loadRequestDefinitionCalls.push(filePath);
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest(options) {
            updateRequestCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              request: {
                id: 'request-1',
                ...requestDefinition,
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'request',
        '--request-id',
        'request-1',
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
      assert.deepEqual(updateRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          requestId: 'request-1',
          request: requestDefinition,
        },
      ]);
      assert.equal(resolveConfigurationCallCount, 0);
      assert.match(stdoutChunks.join(''), /Request updated successfully\./);
      assert.match(stdoutChunks.join(''), /Request ID: request-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should load the variable file, call the shared resource update client, and return zero for human-readable success output', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const variableDefinition = {
        name: 'sale_banner',
        value: 'Spring sale',
      };
      const stdoutChunks = [];
      const stderrChunks = [];
      const loadRequestDefinitionCalls = [];
      const updateResourceCalls = [];
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition(filePath) {
            loadRequestDefinitionCalls.push(filePath);
            return {
              ok: true,
              requestDefinition: variableDefinition,
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            throw new Error('request update client should not be used for variable resources');
          },
        },
        apiEaseCrudResourceClient: {
          async updateResource(options) {
            updateResourceCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              variable: {
                ...variableDefinition,
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await updateRequestCommand.run([
        'update',
        'variable',
        '--variable-name',
        'sale_banner',
        '--file',
        '/tmp/variable.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(loadRequestDefinitionCalls, ['/tmp/variable.json']);
      assert.deepEqual(updateResourceCalls, [
        {
          resourceName: 'variable',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resourceIdentifier: 'sale_banner',
          resource: variableDefinition,
          failureErrorCode: 'VARIABLE_UPDATE_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Variable updated successfully\./);
      assert.match(stdoutChunks.join(''), /Variable Name: sale_banner/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should load the widget file, call the shared resource update client, and return zero for human-readable success output', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const widgetDefinition = {
        widgetId: 'widget-1',
        title: 'Promo banner',
      };
      const stdoutChunks = [];
      const stderrChunks = [];
      const loadRequestDefinitionCalls = [];
      const updateResourceCalls = [];
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition(filePath) {
            loadRequestDefinitionCalls.push(filePath);
            return {
              ok: true,
              requestDefinition: widgetDefinition,
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            throw new Error('request update client should not be used for widget resources');
          },
        },
        apiEaseCrudResourceClient: {
          async updateResource(options) {
            updateResourceCalls.push(options);
            return {
              status: 200,
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              widget: {
                ...widgetDefinition,
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await updateRequestCommand.run([
        'update',
        'widget',
        '--widget-id',
        'widget-1',
        '--file',
        '/tmp/widget.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(loadRequestDefinitionCalls, ['/tmp/widget.json']);
      assert.deepEqual(updateResourceCalls, [
        {
          resourceName: 'widget',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resourceIdentifier: 'widget-1',
          resource: widgetDefinition,
          failureErrorCode: 'WIDGET_UPDATE_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Widget updated successfully\./);
      assert.match(stdoutChunks.join(''), /Widget ID: widget-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should resolve the api key from home configuration when the api key argument is omitted', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Update product',
        type: 'http',
        method: 'PUT',
        address: 'https://api.example.com/products/1',
      };
      const updateRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest(options) {
            updateRequestCalls.push(options);
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'request',
        '--request-id',
        'request-1',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveConfigurationCallCount, 1);
      assert.deepEqual(updateRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'resolved-home-api-key',
          shopDomain: 'cool-shop.myshopify.com',
          requestId: 'request-1',
          request: requestDefinition,
        },
      ]);
    });

    it('should resolve the base url and shop domain from home env variables when those arguments are omitted', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Update product',
        type: 'http',
        method: 'PUT',
        address: 'https://api.example.com/products/1',
      };
      const updateRequestCalls = [];
      let resolveEnvironmentVariablesCallCount = 0;
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest(options) {
            updateRequestCalls.push(options);
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'request',
        '--request-id',
        'request-1',
        '--file',
        '/tmp/request.json',
        '--api-key',
        'explicit-api-key',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveEnvironmentVariablesCallCount, 1);
      assert.deepEqual(updateRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com/from-home',
          apiKey: 'explicit-api-key',
          shopDomain: 'home-shop.myshopify.com',
          requestId: 'request-1',
          request: requestDefinition,
        },
      ]);
    });

    it('should fail fast with usage output when the resource argument is missing', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let updateRequestCallCount = 0;
      let updateResourceCallCount = 0;
      const stderrChunks = [];
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            loadRequestDefinitionCallCount += 1;
            return {
              ok: true,
              requestDefinition: {},
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            updateRequestCallCount += 1;
            return {
              status: 200,
              ok: true,
            };
          },
        },
        apiEaseCrudResourceClient: {
          async updateResource() {
            updateResourceCallCount += 1;
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
      const exitCode = await updateRequestCommand.run([
        'update',
        '--request-id',
        'request-1',
        '--file',
        '/tmp/request.json',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(updateRequestCallCount, 0);
      assert.equal(updateResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required resource argument\./);
      assert.match(stderrChunks.join(''), /Usage: apiease-cli update <request\|widget\|variable>/);
    });

    it('should fail fast with usage output when the resource argument is unsupported', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let updateRequestCallCount = 0;
      let updateResourceCallCount = 0;
      const stderrChunks = [];
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            loadRequestDefinitionCallCount += 1;
            return {
              ok: true,
              requestDefinition: {},
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            updateRequestCallCount += 1;
            return {
              status: 200,
              ok: true,
            };
          },
        },
        apiEaseCrudResourceClient: {
          async updateResource() {
            updateResourceCallCount += 1;
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'product',
        '--file',
        '/tmp/product.json',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(updateRequestCallCount, 0);
      assert.equal(updateResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Unsupported resource: product\./);
      assert.match(stderrChunks.join(''), /Usage: apiease-cli update <request\|widget\|variable>/);
    });

    it('should fail fast with usage output when the selected resource identifier flag is missing', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let updateRequestCallCount = 0;
      let updateResourceCallCount = 0;
      const stderrChunks = [];
      const updateRequestCommand = new UpdateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            loadRequestDefinitionCallCount += 1;
            return {
              ok: true,
              requestDefinition: {},
            };
          },
        },
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            updateRequestCallCount += 1;
            return {
              status: 200,
              ok: true,
            };
          },
        },
        apiEaseCrudResourceClient: {
          async updateResource() {
            updateResourceCallCount += 1;
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'widget',
        '--request-id',
        'request-1',
        '--file',
        '/tmp/widget.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'api-key-1',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(updateRequestCallCount, 0);
      assert.equal(updateResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required arguments: --widget-id/);
      assert.match(stderrChunks.join(''), /Usage: apiease-cli update widget --widget-id <id> --file <path>/);
    });

    it('should fail fast with usage output and no delegated calls when required arguments are missing', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      let updateRequestCallCount = 0;
      const stderrChunks = [];
      const updateRequestCommand = new UpdateRequestCommand({
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            updateRequestCallCount += 1;
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
      const exitCode = await updateRequestCommand.run([
        'update',
        'request',
        '--request-id',
        'request-1',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(updateRequestCallCount, 0);
      assert.match(stderrChunks.join(''), /Usage:/);
      assert.match(stderrChunks.join(''), /--shop-domain/);
      assert.doesNotMatch(stderrChunks.join(''), /Missing required arguments: .*--api-key/);
    });

    it('should return non-zero and write raw json when the update client fails in json mode', async () => {
      // Arrange
      const { UpdateRequestCommand } = await import(updateRequestCommandModuleUrl);
      const result = {
        status: 404,
        ok: false,
        errorCode: 'REQUEST_NOT_FOUND',
        message: 'Unable to update request',
        fieldErrors: [],
      };
      const stdoutChunks = [];
      const updateRequestCommand = new UpdateRequestCommand({
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
        apiEaseUpdateRequestClient: {
          async updateRequest() {
            return result;
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await updateRequestCommand.run([
        'update',
        'request',
        '--request-id',
        'missing-request',
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
