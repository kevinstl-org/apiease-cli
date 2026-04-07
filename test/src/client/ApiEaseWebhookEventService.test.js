import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

const serviceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseWebhookEventService.js'),
).href;

describe('ApiEaseWebhookEventService', () => {
  describe('normalizeWebhookEvent', () => {
    it('should normalize slash-form Shopify topics to the canonical APIEase webhook event', async () => {
      // Arrange
      const { ApiEaseWebhookEventService } = await import(serviceModuleUrl);
      const apiEaseWebhookEventService = new ApiEaseWebhookEventService();

      // Act
      const result = apiEaseWebhookEventService.normalizeWebhookEvent('carts/update');

      // Assert
      assert.equal(result, 'CARTS_UPDATE');
    });

    it('should preserve canonical webhook events that are already supported', async () => {
      // Arrange
      const { ApiEaseWebhookEventService } = await import(serviceModuleUrl);
      const apiEaseWebhookEventService = new ApiEaseWebhookEventService();

      // Act
      const result = apiEaseWebhookEventService.normalizeWebhookEvent('moved_fulfillment_order');

      // Assert
      assert.equal(result, 'moved_fulfillment_order');
    });
  });

  describe('normalizeRequestWebhookEvents', () => {
    it('should normalize webhook trigger events without mutating the original request payload', async () => {
      // Arrange
      const { ApiEaseWebhookEventService } = await import(serviceModuleUrl);
      const apiEaseWebhookEventService = new ApiEaseWebhookEventService();
      const request = {
        type: 'http',
        method: 'POST',
        address: 'https://example.com/orders',
        triggers: [
          {
            type: 'webhook',
            webhook: {
              event: 'orders/create',
            },
          },
          {
            type: 'proxyEndpoint',
            proxyEndpoint: {
              path: 'orders',
              method: 'POST',
              authenticated: true,
            },
          },
        ],
      };

      // Act
      const result = apiEaseWebhookEventService.normalizeRequestWebhookEvents(request);

      // Assert
      assert.deepEqual(result, {
        type: 'http',
        method: 'POST',
        address: 'https://example.com/orders',
        triggers: [
          {
            type: 'webhook',
            webhook: {
              event: 'ORDERS_CREATE',
            },
          },
          {
            type: 'proxyEndpoint',
            proxyEndpoint: {
              path: 'orders',
              method: 'POST',
              authenticated: true,
            },
          },
        ],
      });
      assert.deepEqual(request, {
        type: 'http',
        method: 'POST',
        address: 'https://example.com/orders',
        triggers: [
          {
            type: 'webhook',
            webhook: {
              event: 'orders/create',
            },
          },
          {
            type: 'proxyEndpoint',
            proxyEndpoint: {
              path: 'orders',
              method: 'POST',
              authenticated: true,
            },
          },
        ],
      });
    });
  });
});
