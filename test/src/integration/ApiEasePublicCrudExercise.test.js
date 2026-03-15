import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const moduleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'integration', 'ApiEasePublicCrudExercise.js'),
).href;

describe('ApiEasePublicCrudExercise', () => {
  describe('run', () => {
    it('should exercise request widget and shop-variable crud flows and clean up created resources', async () => {
      // Arrange
      const { ApiEasePublicCrudExercise } = await import(moduleUrl);
      const fetchCalls = [];
      const fetchImplementation = createQueuedFetchImplementation([
        buildFetchResponse(201, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request exercise-123',
            type: 'http',
            method: 'GET',
            address: 'https://example.com/codex/request/exercise-123',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          requests: [{ id: 'request-1' }],
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request exercise-123',
            type: 'http',
            method: 'GET',
            address: 'https://example.com/codex/request/exercise-123',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request Updated exercise-123',
            type: 'http',
            method: 'POST',
            address: 'https://example.com/codex/request/exercise-123/updated',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(201, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget exercise-123',
            liquid: '<section>exercise-123</section>',
            javascript: 'console.log("exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widgets: [{ widgetId: 'widget-1' }],
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget exercise-123',
            liquid: '<section>exercise-123</section>',
            javascript: 'console.log("exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget Updated exercise-123',
            liquid: '<section>updated exercise-123</section>',
            javascript: 'console.log("updated-exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(201, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          shopVariable: {
            name: 'codex_variable_exercise_123',
            sensitive: true,
            displayValue: '***********',
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          shopVariables: [{ name: 'codex_variable_exercise_123' }],
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          shopVariable: {
            name: 'codex_variable_exercise_123',
            sensitive: true,
            displayValue: '***********',
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          shopVariable: {
            name: 'codex_variable_exercise_123',
            sensitive: false,
            value: 'updated-value-exercise-123',
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          shopVariable: {
            name: 'codex_variable_exercise_123',
            sensitive: false,
            value: 'updated-value-exercise-123',
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget Updated exercise-123',
            liquid: '<section>updated exercise-123</section>',
            javascript: 'console.log("updated-exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request Updated exercise-123',
            type: 'http',
            method: 'POST',
            address: 'https://example.com/codex/request/exercise-123/updated',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
      ], fetchCalls);
      const apiEasePublicCrudExercise = new ApiEasePublicCrudExercise({
        apiBaseUrl: 'https://apiease.example.com/root',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        fetchImplementation,
        exerciseIdProvider: () => 'exercise-123',
      });

      // Act
      const result = await apiEasePublicCrudExercise.run();

      // Assert
      assert.equal(fetchCalls.length, 15);
      assert.deepEqual(
        fetchCalls.map((call) => `${call.options.method} ${call.url}`),
        [
          'POST https://apiease.example.com/root/api/v1/resources/requests',
          'GET https://apiease.example.com/root/api/v1/resources/requests',
          'GET https://apiease.example.com/root/api/v1/resources/requests/request-1',
          'PUT https://apiease.example.com/root/api/v1/resources/requests/request-1',
          'POST https://apiease.example.com/root/api/v1/resources/widgets',
          'GET https://apiease.example.com/root/api/v1/resources/widgets',
          'GET https://apiease.example.com/root/api/v1/resources/widgets/widget-1',
          'PUT https://apiease.example.com/root/api/v1/resources/widgets/widget-1',
          'POST https://apiease.example.com/root/api/v1/resources/shopVariables',
          'GET https://apiease.example.com/root/api/v1/resources/shopVariables',
          'GET https://apiease.example.com/root/api/v1/resources/shopVariables/codex_variable_exercise_123',
          'PUT https://apiease.example.com/root/api/v1/resources/shopVariables/codex_variable_exercise_123',
          'DELETE https://apiease.example.com/root/api/v1/resources/shopVariables/codex_variable_exercise_123',
          'DELETE https://apiease.example.com/root/api/v1/resources/widgets/widget-1',
          'DELETE https://apiease.example.com/root/api/v1/resources/requests/request-1',
        ],
      );
      assert.equal(fetchCalls[0].options.headers['x-apiease-api-key'], 'api-key-1');
      assert.equal(fetchCalls[0].options.headers['x-shop-myshopify-domain'], 'cool-shop.myshopify.com');
      assert.deepEqual(JSON.parse(fetchCalls[0].options.body), {
        name: 'Codex Request exercise-123',
        type: 'http',
        method: 'GET',
        address: 'https://example.com/codex/request/exercise-123',
      });
      assert.deepEqual(JSON.parse(fetchCalls[7].options.body), {
        widgetHandle: 'codex-widget-exercise-123',
        widgetName: 'Codex Widget Updated exercise-123',
        liquid: '<section>updated exercise-123</section>',
        javascript: 'console.log("updated-exercise-123");',
      });
      assert.deepEqual(JSON.parse(fetchCalls[11].options.body), {
        value: 'updated-value-exercise-123',
        sensitive: false,
      });
      assert.equal(result.exerciseId, 'exercise-123');
      assert.equal(result.request.requestId, 'request-1');
      assert.equal(result.widget.widgetId, 'widget-1');
      assert.equal(result.shopVariable.variableName, 'codex_variable_exercise_123');
      assert.deepEqual(
        result.cleanupResults.map((cleanupResult) => cleanupResult.resourceType),
        ['shopVariable', 'widget', 'request'],
      );
    });

    it('should clean up created resources when a later crud step fails', async () => {
      // Arrange
      const { ApiEasePublicCrudExercise } = await import(moduleUrl);
      const fetchCalls = [];
      const fetchImplementation = createQueuedFetchImplementation([
        buildFetchResponse(201, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request exercise-123',
            type: 'http',
            method: 'GET',
            address: 'https://example.com/codex/request/exercise-123',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          requests: [{ id: 'request-1' }],
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request exercise-123',
            type: 'http',
            method: 'GET',
            address: 'https://example.com/codex/request/exercise-123',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request Updated exercise-123',
            type: 'http',
            method: 'POST',
            address: 'https://example.com/codex/request/exercise-123/updated',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
        buildFetchResponse(201, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget exercise-123',
            liquid: '<section>exercise-123</section>',
            javascript: 'console.log("exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(500, {
          ok: false,
          errorCode: 'WIDGET_READ_FAILED',
          message: 'Unable to list widgets',
          fieldErrors: [],
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          widget: {
            widgetId: 'widget-1',
            widgetHandle: 'codex-widget-exercise-123',
            widgetName: 'Codex Widget exercise-123',
            liquid: '<section>exercise-123</section>',
            javascript: 'console.log("exercise-123");',
            externalJavascriptUrls: [],
            disableJavascript: false,
          },
        }),
        buildFetchResponse(200, {
          ok: true,
          shopDomain: 'cool-shop.myshopify.com',
          request: {
            id: 'request-1',
            name: 'Codex Request Updated exercise-123',
            type: 'http',
            method: 'POST',
            address: 'https://example.com/codex/request/exercise-123/updated',
            liquid: '',
            parameters: [],
            triggers: [],
          },
        }),
      ], fetchCalls);
      const apiEasePublicCrudExercise = new ApiEasePublicCrudExercise({
        apiBaseUrl: 'https://apiease.example.com/root',
        apiKey: 'api-key-1',
        shopDomain: 'cool-shop.myshopify.com',
        fetchImplementation,
        exerciseIdProvider: () => 'exercise-123',
      });

      // Act
      await assert.rejects(
        apiEasePublicCrudExercise.run(),
        (error) => {
          // Assert
          assert.equal(error.message, 'Unable to list widgets');
          assert.deepEqual(
            fetchCalls.map((call) => `${call.options.method} ${call.url}`),
            [
              'POST https://apiease.example.com/root/api/v1/resources/requests',
              'GET https://apiease.example.com/root/api/v1/resources/requests',
              'GET https://apiease.example.com/root/api/v1/resources/requests/request-1',
              'PUT https://apiease.example.com/root/api/v1/resources/requests/request-1',
              'POST https://apiease.example.com/root/api/v1/resources/widgets',
              'GET https://apiease.example.com/root/api/v1/resources/widgets',
              'DELETE https://apiease.example.com/root/api/v1/resources/widgets/widget-1',
              'DELETE https://apiease.example.com/root/api/v1/resources/requests/request-1',
            ],
          );
          assert.deepEqual(
            error.cleanupResults.map((cleanupResult) => cleanupResult.resourceType),
            ['widget', 'request'],
          );
          return true;
        },
      );
    });
  });
});

function buildFetchResponse(status, payload) {
  return {
    status,
    async json() {
      return payload;
    },
  };
}

function createQueuedFetchImplementation(responseQueue, fetchCalls) {
  return async (url, options) => {
    fetchCalls.push({ url, options });
    const response = responseQueue.shift();
    if (!response) {
      throw new Error(`Unexpected fetch invocation for ${options.method} ${url}`);
    }

    return response;
  };
}
