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
      let resolveConfigurationCallCount = 0;
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
      const apiEaseHomeConfigurationResolver = {
        async resolveConfiguration() {
          resolveConfigurationCallCount += 1;
          return {
            ok: true,
            apiKey: 'home-api-key',
          };
        },
      };
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader,
        apiEaseCreateRequestClient,
        apiEaseHomeConfigurationResolver,
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
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
      assert.equal(resolveConfigurationCallCount, 0);
      assert.match(stdoutChunks.join(''), /Request created successfully\./);
      assert.match(stdoutChunks.join(''), /request-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should load the widget file, call the shared resource create client, and return zero for human-readable success output', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const widgetDefinition = {
        widgetId: 'widget-1',
        title: 'Promo banner',
      };
      const stdoutChunks = [];
      const stderrChunks = [];
      const loadRequestDefinitionCalls = [];
      const createResourceCalls = [];
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition(filePath) {
            loadRequestDefinitionCalls.push(filePath);
            return {
              ok: true,
              requestDefinition: widgetDefinition,
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest() {
            throw new Error('request create client should not be used for widget resources');
          },
        },
        apiEaseCrudResourceClient: {
          async createResource(options) {
            createResourceCalls.push(options);
            return {
              status: 201,
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
      const exitCode = await createRequestCommand.run([
        'create',
        'widget',
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
      assert.deepEqual(createResourceCalls, [
        {
          resourceName: 'widget',
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'api-key-1',
          shopDomain: 'cool-shop.myshopify.com',
          resource: widgetDefinition,
          failureErrorCode: 'WIDGET_CREATE_FAILED',
        },
      ]);
      assert.match(stdoutChunks.join(''), /Widget created successfully\./);
      assert.match(stdoutChunks.join(''), /Widget ID: widget-1/);
      assert.equal(stderrChunks.join(''), '');
    });

    it('should resolve the api key from home configuration when the api key argument is omitted', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Create product',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/products',
      };
      const createRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest(options) {
            createRequestCalls.push(options);
            return {
              status: 201,
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
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
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
      assert.deepEqual(createRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'resolved-home-api-key',
          shopDomain: 'cool-shop.myshopify.com',
          request: requestDefinition,
        },
      ]);
    });

    it('should prefer the explicit api key and skip home configuration resolution when both are available', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Create product',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/products',
      };
      const createRequestCalls = [];
      let resolveConfigurationCallCount = 0;
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest(options) {
            createRequestCalls.push(options);
            return {
              status: 201,
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
            throw new Error('home configuration should not be resolved');
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--api-key',
        'explicit-api-key',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveConfigurationCallCount, 0);
      assert.deepEqual(createRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com',
          apiKey: 'explicit-api-key',
          shopDomain: 'cool-shop.myshopify.com',
          request: requestDefinition,
        },
      ]);
    });

    it('should resolve the base url and shop domain from home env variables when those arguments are omitted', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      const requestDefinition = {
        name: 'Create product',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/products',
      };
      const createRequestCalls = [];
      let resolveEnvironmentVariablesCallCount = 0;
      const createRequestCommand = new CreateRequestCommand({
        requestDefinitionFileLoader: {
          async loadRequestDefinition() {
            return {
              ok: true,
              requestDefinition,
            };
          },
        },
        apiEaseCreateRequestClient: {
          async createRequest(options) {
            createRequestCalls.push(options);
            return {
              status: 201,
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
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
        '--file',
        '/tmp/request.json',
        '--api-key',
        'explicit-api-key',
      ]);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(resolveEnvironmentVariablesCallCount, 1);
      assert.deepEqual(createRequestCalls, [
        {
          apiBaseUrl: 'https://apiease.example.com/from-home',
          apiKey: 'explicit-api-key',
          shopDomain: 'home-shop.myshopify.com',
          request: requestDefinition,
        },
      ]);
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
        'request',
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

    it('should fail fast with usage output when the resource argument is missing', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let createRequestCallCount = 0;
      let createResourceCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async createResource() {
            createResourceCallCount += 1;
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
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(createRequestCallCount, 0);
      assert.equal(createResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required resource argument\./);
      assert.match(stderrChunks.join(''), /Usage: apiease-cli create <request\|widget\|variable>/);
    });

    it('should fail fast with usage output when the resource argument is unsupported', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let createRequestCallCount = 0;
      let createResourceCallCount = 0;
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
        apiEaseCrudResourceClient: {
          async createResource() {
            createResourceCallCount += 1;
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
        'product',
        '--file',
        '/tmp/product.json',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(createRequestCallCount, 0);
      assert.equal(createResourceCallCount, 0);
      assert.match(stderrChunks.join(''), /Unsupported resource: product\./);
      assert.match(stderrChunks.join(''), /Usage: apiease-cli create <request\|widget\|variable>/);
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
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
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
      assert.doesNotMatch(stderrChunks.join(''), /Missing required arguments: .*--api-key/);
    });

    it('should fail fast with usage output when base url and shop domain are omitted and not present in home env variables', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let createRequestCallCount = 0;
      let resolveEnvironmentVariablesCallCount = 0;
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
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            resolveEnvironmentVariablesCallCount += 1;
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {},
            };
          },
        },
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
        '--file',
        '/tmp/request.json',
        '--api-key',
        'explicit-api-key',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(resolveEnvironmentVariablesCallCount, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(createRequestCallCount, 0);
      assert.match(stderrChunks.join(''), /Missing required arguments: --base-url, --shop-domain/);
      assert.match(stderrChunks.join(''), /Usage:/);
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
        'request',
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

    it('should return non-zero and write the home configuration failure result when api key resolution fails', async () => {
      // Arrange
      const { CreateRequestCommand } = await import(createRequestCommandModuleUrl);
      let loadRequestDefinitionCallCount = 0;
      let createRequestCallCount = 0;
      const stdoutChunks = [];
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
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            return {
              ok: false,
              errorCode: 'APIEASE_HOME_ENVIRONMENT_FILE_NOT_FOUND',
              message: 'APIEASE home environment file was not found: /tmp/home/.apiease/environment',
              fieldErrors: [],
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream([]),
      });

      // Act
      const exitCode = await createRequestCommand.run([
        'create',
        'request',
        '--file',
        '/tmp/request.json',
        '--base-url',
        'https://apiease.example.com',
        '--shop-domain',
        'cool-shop.myshopify.com',
        '--json',
      ]);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(loadRequestDefinitionCallCount, 0);
      assert.equal(createRequestCallCount, 0);
      assert.deepEqual(JSON.parse(stdoutChunks.join('')), {
        ok: false,
        errorCode: 'APIEASE_HOME_ENVIRONMENT_FILE_NOT_FOUND',
        message: 'APIEASE home environment file was not found: /tmp/home/.apiease/environment',
        fieldErrors: [],
      });
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
