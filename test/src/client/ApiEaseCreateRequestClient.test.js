import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

const clientModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseCreateRequestClient.js'),
).href;

describe('ApiEaseCreateRequestClient', () => {
  describe('constructor', () => {
    it('should be constructible for package bootstrap usage', async () => {
      // Arrange
      const { ApiEaseCreateRequestClient } = await import(clientModuleUrl);

      // Act
      const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient();

      // Assert
      assert.ok(apiEaseCreateRequestClient instanceof ApiEaseCreateRequestClient);
    });
  });

  describe('createRequest', () => {
    it('should post the validated request payload to the programmatic create endpoint', async () => {
      // Arrange
      const { ApiEaseCreateRequestClient } = await import(clientModuleUrl);
      const validationResult = {
        isValid: true,
        errorCode: null,
        message: '',
        fieldErrors: [],
      };
      const request = {
        name: 'Create product',
        type: 'http',
        method: 'POST',
        address: 'https://api.example.com/products',
      };
      const validationCalls = [];
      const fetchCalls = [];
      const apiEaseCreateRequestContractValidator = {
        validate(payload) {
          validationCalls.push(payload);
          return validationResult;
        },
      };
      const fetchImplementation = async (url, options) => {
        fetchCalls.push({ url, options });
        return {
          status: 201,
          async json() {
            return {
              ok: true,
              shopDomain: 'cool-shop.myshopify.com',
              request: {
                id: 'request-1',
                ...request,
              },
            };
          },
        };
      };
      const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient({
        fetchImplementation,
        apiEaseCreateRequestContractValidator,
      });

      // Act
      const result = await apiEaseCreateRequestClient.createRequest({
        apiBaseUrl: 'https://apiease.example.com/root/',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        request,
      });

      // Assert
      assert.deepEqual(validationCalls, [request]);
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0].url, 'https://apiease.example.com/root/api/programmatic/requests');
      assert.equal(fetchCalls[0].options.method, 'POST');
      assert.equal(fetchCalls[0].options.headers['content-type'], 'application/json');
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.equal(fetchCalls[0].options.body, JSON.stringify(request));
      assert.deepEqual(result, {
        status: 201,
        ok: true,
        shopDomain: 'cool-shop.myshopify.com',
        request: {
          id: 'request-1',
          ...request,
        },
      });
    });

    it('should return backend failure payloads with the response status', async () => {
      // Arrange
      const { ApiEaseCreateRequestClient } = await import(clientModuleUrl);
      const request = {
        type: 'http',
      };
      const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient({
        apiEaseCreateRequestContractValidator: {
          validate() {
            return {
              isValid: true,
              errorCode: null,
              message: '',
              fieldErrors: [],
            };
          },
        },
        fetchImplementation: async () => ({
          status: 422,
          async json() {
            return {
              ok: false,
              errorCode: 'INVALID_REQUEST_CREATE_CONTRACT',
              message: 'Request create payload is invalid',
              fieldErrors: [
                {
                  path: 'address',
                  code: 'REQUIRED',
                  message: 'Field is required',
                },
              ],
            };
          },
        }),
      });

      // Act
      const result = await apiEaseCreateRequestClient.createRequest({
        apiBaseUrl: 'https://apiease.example.com',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        request,
      });

      // Assert
      assert.deepEqual(result, {
        status: 422,
        ok: false,
        errorCode: 'INVALID_REQUEST_CREATE_CONTRACT',
        message: 'Request create payload is invalid',
        fieldErrors: [
          {
            path: 'address',
            code: 'REQUIRED',
            message: 'Field is required',
          },
        ],
      });
    });

    it('should short-circuit local contract validation failures without making a network request', async () => {
      // Arrange
      const { ApiEaseCreateRequestClient } = await import(clientModuleUrl);
      let fetchCallCount = 0;
      const validationResult = {
        isValid: false,
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
      const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient({
        apiEaseCreateRequestContractValidator: {
          validate() {
            return validationResult;
          },
        },
        fetchImplementation: async () => {
          fetchCallCount += 1;
          return {
            status: 500,
            async json() {
              return {};
            },
          };
        },
      });

      // Act
      const result = await apiEaseCreateRequestClient.createRequest({
        apiBaseUrl: 'https://apiease.example.com',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        request: {},
      });

      // Assert
      assert.equal(fetchCallCount, 0);
      assert.deepEqual(result, {
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
      });
    });
  });
});
