import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

const clientModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseCrudResourceClient.js'),
).href;

describe('ApiEaseCrudResourceClient', () => {
  describe('constructor', () => {
    it('should be constructible for reusable resource-aware CRUD calls', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);

      // Act
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient();

      // Assert
      assert.ok(apiEaseCrudResourceClient instanceof ApiEaseCrudResourceClient);
    });
  });

  describe('createResource', () => {
    it('should post the payload to the versioned widget collection endpoint', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);
      const widget = {
        widgetName: 'Featured products',
        liquid: '<section>featured</section>',
      };
      const fetchCalls = [];
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({
        fetchImplementation: async (url, options) => {
          fetchCalls.push({ url, options });
          return {
            status: 201,
            async json() {
              return {
                ok: true,
                widget: {
                  widgetId: 'widget-1',
                  ...widget,
                },
              };
            },
          };
        },
      });

      // Act
      const result = await apiEaseCrudResourceClient.createResource({
        resourceName: 'widget',
        apiBaseUrl: 'https://apiease.example.com/root/',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        resource: widget,
        failureErrorCode: 'WIDGET_CREATE_FAILED',
      });

      // Assert
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, 'https://apiease.example.com/root/api/v1/resources/widgets');
      assert.equal(fetchCalls[0].options.method, 'POST');
      assert.equal(fetchCalls[0].options.headers['content-type'], 'application/json');
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.equal(fetchCalls[0].options.body, JSON.stringify(widget));
      assert.deepEqual(result, {
        status: 201,
        ok: true,
        widget: {
          widgetId: 'widget-1',
          ...widget,
        },
      });
    });
  });

  describe('readResource', () => {
    it('should get the resource from the versioned variable item endpoint', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);
      const fetchCalls = [];
      const variable = {
        name: 'sale-banner',
        value: 'enabled',
      };
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({
        fetchImplementation: async (url, options) => {
          fetchCalls.push({ url, options });
          return {
            status: 200,
            async json() {
              return {
                ok: true,
                variable,
              };
            },
          };
        },
      });

      // Act
      const result = await apiEaseCrudResourceClient.readResource({
        resourceName: 'variable',
        apiBaseUrl: 'https://apiease.example.com/root',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        resourceIdentifier: 'sale banner',
        failureErrorCode: 'VARIABLE_READ_FAILED',
      });

      // Assert
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, 'https://apiease.example.com/root/api/v1/resources/variables/sale%20banner');
      assert.equal(fetchCalls[0].options.method, 'GET');
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.deepEqual(result, {
        status: 200,
        ok: true,
        variable,
      });
    });
  });

  describe('updateResource', () => {
    it('should put the payload to the versioned widget item endpoint', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);
      const widget = {
        widgetName: 'Featured products updated',
        liquid: '<section>updated</section>',
      };
      const fetchCalls = [];
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({
        fetchImplementation: async (url, options) => {
          fetchCalls.push({ url, options });
          return {
            status: 200,
            async json() {
              return {
                ok: true,
                widget: {
                  widgetId: 'widget/1 & 2',
                  ...widget,
                },
              };
            },
          };
        },
      });

      // Act
      const result = await apiEaseCrudResourceClient.updateResource({
        resourceName: 'widget',
        apiBaseUrl: 'https://apiease.example.com/root/',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        resourceIdentifier: 'widget/1 & 2',
        resource: widget,
        failureErrorCode: 'WIDGET_UPDATE_FAILED',
      });

      // Assert
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, 'https://apiease.example.com/root/api/v1/resources/widgets/widget%2F1%20%26%202');
      assert.equal(fetchCalls[0].options.method, 'PUT');
      assert.equal(fetchCalls[0].options.headers['content-type'], 'application/json');
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.equal(fetchCalls[0].options.body, JSON.stringify(widget));
      assert.deepEqual(result, {
        status: 200,
        ok: true,
        widget: {
          widgetId: 'widget/1 & 2',
          ...widget,
        },
      });
    });
  });

  describe('deleteResource', () => {
    it('should delete the resource from the versioned variable item endpoint without a request body', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);
      const fetchCalls = [];
      const variable = {
        name: 'sale-banner',
        value: 'enabled',
      };
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({
        fetchImplementation: async (url, options) => {
          fetchCalls.push({ url, options });
          return {
            status: 200,
            async json() {
              return {
                ok: true,
                variable,
              };
            },
          };
        },
      });

      // Act
      const result = await apiEaseCrudResourceClient.deleteResource({
        resourceName: 'variable',
        apiBaseUrl: 'https://apiease.example.com/root',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        resourceIdentifier: 'sale banner',
        failureErrorCode: 'VARIABLE_DELETE_FAILED',
      });

      // Assert
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, 'https://apiease.example.com/root/api/v1/resources/variables/sale%20banner');
      assert.equal(fetchCalls[0].options.method, 'DELETE');
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.equal(fetchCalls[0].options.body, undefined);
      assert.deepEqual(result, {
        status: 200,
        ok: true,
        variable,
      });
    });

    it('should return a structured failure when the API responds with html instead of json', async () => {
      // Arrange
      const { ApiEaseCrudResourceClient } = await import(clientModuleUrl);
      const apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({
        fetchImplementation: async () => ({
          status: 502,
          headers: {
            get(name) {
              return name === 'content-type' ? 'text/html; charset=utf-8' : null;
            },
          },
          async text() {
            return '<!DOCTYPE html><html><body>Bad gateway</body></html>';
          },
          async json() {
            throw new Error('response.json should not be called for html responses');
          },
        }),
      });

      // Act
      const result = await apiEaseCrudResourceClient.deleteResource({
        resourceName: 'widget',
        apiBaseUrl: 'https://apiease.example.com',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        resourceIdentifier: 'widget-1',
        failureErrorCode: 'WIDGET_DELETE_FAILED',
      });

      // Assert
      assert.deepEqual(result, {
        status: 502,
        ok: false,
        errorCode: 'WIDGET_DELETE_FAILED',
        message: 'API returned a non-JSON response with status 502 and content-type text/html; response starts with <!DOCTYPE html><html><body>Bad gateway</body></html>',
        fieldErrors: [],
      });
    });
  });
});
