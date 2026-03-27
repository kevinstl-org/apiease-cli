import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const apiEaseCommandConfigurationResolverModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'ApiEaseCommandConfigurationResolver.js'),
).href;

describe('ApiEaseCommandConfigurationResolver', () => {
  describe('resolveConfiguration', () => {
    it('should prefer explicit values and skip home configuration resolution when all values are provided', async () => {
      // Arrange
      const { ApiEaseCommandConfigurationResolver } = await import(apiEaseCommandConfigurationResolverModuleUrl);
      let resolveEnvironmentVariablesCallCount = 0;
      const apiEaseCommandConfigurationResolver = new ApiEaseCommandConfigurationResolver({
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            resolveEnvironmentVariablesCallCount += 1;
            throw new Error('home configuration should not be resolved');
          },
        },
      });

      // Act
      const result = await apiEaseCommandConfigurationResolver.resolveConfiguration({
        explicitApiBaseUrl: 'https://apiease.example.com',
        explicitApiKey: 'explicit-api-key',
        explicitShopDomain: 'cool-shop.myshopify.com',
      });

      // Assert
      assert.deepEqual(result, {
        ok: true,
        apiBaseUrl: 'https://apiease.example.com',
        apiKey: 'explicit-api-key',
        shopDomain: 'cool-shop.myshopify.com',
      });
      assert.equal(resolveEnvironmentVariablesCallCount, 0);
    });

    it('should resolve the base url and shop domain from home env variables when those values are omitted', async () => {
      // Arrange
      const { ApiEaseCommandConfigurationResolver } = await import(apiEaseCommandConfigurationResolverModuleUrl);
      let resolveEnvironmentVariablesCallCount = 0;
      const apiEaseCommandConfigurationResolver = new ApiEaseCommandConfigurationResolver({
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            resolveEnvironmentVariablesCallCount += 1;
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {
                APIEASE_API_KEY: 'home-api-key',
                APIEASE_BASE_URL: 'https://apiease.example.com/from-home',
                APIEASE_SHOP_DOMAIN: 'home-shop.myshopify.com',
              },
            };
          },
        },
      });

      // Act
      const result = await apiEaseCommandConfigurationResolver.resolveConfiguration({
        explicitApiKey: 'explicit-api-key',
      });

      // Assert
      assert.deepEqual(result, {
        ok: true,
        apiBaseUrl: 'https://apiease.example.com/from-home',
        apiKey: 'explicit-api-key',
        shopDomain: 'home-shop.myshopify.com',
      });
      assert.equal(resolveEnvironmentVariablesCallCount, 1);
    });

    it('should return the home api key missing failure when the api key is omitted and not defined in the home env file', async () => {
      // Arrange
      const { ApiEaseCommandConfigurationResolver } = await import(apiEaseCommandConfigurationResolverModuleUrl);
      const apiEaseCommandConfigurationResolver = new ApiEaseCommandConfigurationResolver({
        apiEaseHomeConfigurationResolver: {
          async resolveEnvironmentVariables() {
            return {
              ok: true,
              environmentVariablesFilePath: '/tmp/home/.apiease/.env.staging',
              environmentVariables: {
                APIEASE_BASE_URL: 'https://apiease.example.com/from-home',
                APIEASE_SHOP_DOMAIN: 'home-shop.myshopify.com',
              },
            };
          },

          buildApiKeyMissingFailureResult(environmentVariablesFilePath) {
            return {
              ok: false,
              errorCode: 'APIEASE_HOME_API_KEY_MISSING',
              message: `APIEASE_API_KEY was not found in environment file: ${environmentVariablesFilePath}`,
              filePath: environmentVariablesFilePath,
              fieldErrors: [],
            };
          },
        },
      });

      // Act
      const result = await apiEaseCommandConfigurationResolver.resolveConfiguration({});

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_HOME_API_KEY_MISSING',
        message: 'APIEASE_API_KEY was not found in environment file: /tmp/home/.apiease/.env.staging',
        filePath: '/tmp/home/.apiease/.env.staging',
        fieldErrors: [],
      });
    });
  });
});
