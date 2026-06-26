import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const serviceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseRequestSourceIdentifierMigrationService.js'),
).href;

describe('ApiEaseRequestSourceIdentifierMigrationService', () => {
  describe('validateRequestHandle', () => {
    it('should allow a handle that matches the APIEase handle format', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.validateRequestHandle('lookup-shopify-order-1');

      // Assert
      assert.deepEqual(result, {
        ok: true,
        handle: 'lookup-shopify-order-1',
      });
    });

    it('should reject a handle that does not match the APIEase handle format', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.validateRequestHandle('Lookup Shopify Order');

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_REQUEST_HANDLE_INVALID',
        message: 'Request handle must use lowercase letters, numbers, and single hyphens between words.',
        fieldErrors: [
          {
            path: 'handle',
            code: 'INVALID_VALUE',
            message: 'Must match ^[a-z0-9]+(?:-[a-z0-9]+)*$',
          },
        ],
      });
    });

    it('should reject a handle value that is not a string', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.validateRequestHandle(undefined);

      // Assert
      assert.equal(result.ok, false);
      assert.equal(result.errorCode, 'APIEASE_REQUEST_HANDLE_INVALID');
    });
  });

  describe('migrateRequestSourceIdentifier', () => {
    it('should preserve an existing valid handle and remove id', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        id: 'request-1',
        handle: 'lookup-shopify-order',
        name: 'Lookup Shopify Order',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(result.ok, true);
      assert.equal(result.requestDefinition.handle, 'lookup-shopify-order');
      assert.equal(Object.hasOwn(result.requestDefinition, 'id'), false);
    });

    it('should fail when an existing handle is invalid', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        handle: 'Lookup Shopify Order',
        name: 'Lookup Shopify Order',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(result.ok, false);
      assert.equal(result.errorCode, 'APIEASE_REQUEST_HANDLE_INVALID');
    });

    it('should move a non-UUID id to handle', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        id: 'lookup-shopify-discount-code-admin-graphql',
        name: 'Lookup Shopify Discount Code',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(result.ok, true);
      assert.equal(result.requestDefinition.handle, 'lookup-shopify-discount-code-admin-graphql');
      assert.equal(Object.hasOwn(result.requestDefinition, 'id'), false);
    });

    it('should derive handle from name when id is UUID-shaped', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        id: '8B0B6243-93E5-4B05-89A3-4C0D1D8F5C25',
        name: 'Lookup Shopify Discount Code',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(result.ok, true);
      assert.equal(result.requestDefinition.handle, 'lookup-shopify-discount-code');
      assert.equal(Object.hasOwn(result.requestDefinition, 'id'), false);
    });

    it('should derive handle from name when id and handle are missing', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        name: 'Lookup Shopify Discount Code',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(result.ok, true);
      assert.equal(result.requestDefinition.handle, 'lookup-shopify-discount-code');
    });

    it('should fail when neither id nor name can produce a handle', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        name: '!!!',
      });

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_REQUEST_HANDLE_NOT_INFERRED',
        message: 'Request handle cannot be inferred from id or name.',
        fieldErrors: [
          {
            path: 'handle',
            code: 'REQUIRED',
            message: 'Add handle or provide a name that can be converted to a handle.',
          },
        ],
      });
    });

    it('should not change functional request configuration', async () => {
      // Arrange
      const { ApiEaseRequestSourceIdentifierMigrationService } = await import(serviceModuleUrl);
      const apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService();
      const requestDefinition = createRequestDefinition({
        id: '8b0b6243-93e5-4b05-89a3-4c0d1d8f5c25',
        name: 'Lookup Shopify Discount Code',
      });
      const functionalConfigurationJson = JSON.stringify(readFunctionalConfiguration(requestDefinition));

      // Act
      const result = apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);

      // Assert
      assert.equal(JSON.stringify(readFunctionalConfiguration(result.requestDefinition)), functionalConfigurationJson);
    });
  });
});

function createRequestDefinition(identifierFields) {
  return {
    ...identifierFields,
    type: 'http',
    method: 'POST',
    address: 'https://example.com/admin/api/graphql.json',
    parameters: [
      {
        type: 'header',
        name: 'Content-Type',
        value: 'application/json',
        sensitive: false,
      },
      {
        type: 'body',
        value: '{"query":"query DiscountCode { codeDiscountNode(id: $id) { id } }"}',
      },
    ],
    triggers: [
      {
        type: 'proxyEndpoint',
        proxyEndpoint: {
          path: 'discount-code',
          method: 'POST',
          authenticated: true,
        },
      },
    ],
    liquid: '',
    body: {
      query: 'query DiscountCode { codeDiscountNode(id: $id) { id } }',
    },
    nextRequest: {
      handle: 'next-request',
    },
  };
}

function readFunctionalConfiguration(requestDefinition) {
  return {
    type: requestDefinition.type,
    method: requestDefinition.method,
    address: requestDefinition.address,
    parameters: requestDefinition.parameters,
    triggers: requestDefinition.triggers,
    liquid: requestDefinition.liquid,
    body: requestDefinition.body,
    nextRequest: requestDefinition.nextRequest,
  };
}
