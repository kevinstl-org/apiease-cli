import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');

const validatorModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'client', 'ApiEaseCreateRequestContractValidator.js'),
).href;

test('ApiEaseCreateRequestContractValidator validate should return no field errors for a valid http request payload', async () => {
  // Arrange
  const { ApiEaseCreateRequestContractValidator } = await import(validatorModuleUrl);
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();
  const payload = {
    id: 'request-1',
    name: 'Inventory lookup',
    type: 'http',
    method: 'POST',
    address: 'https://example.com/products/{productId}',
    parameters: [
      {
        type: 'path',
        name: 'productId',
        value: '{SHOPIFY_PRODUCT_ID}',
        sensitive: false,
      },
      {
        type: 'body',
        value: '{"includeArchived":false}',
      },
    ],
    triggers: [
      {
        type: 'proxyEndpoint',
        proxyEndpoint: {
          path: 'inventory/items',
          method: 'GET',
          authenticated: true,
        },
      },
    ],
  };

  // Act
  const result = apiEaseCreateRequestContractValidator.validate(payload);

  // Assert
  assert.deepEqual(result, {
    isValid: true,
    errorCode: null,
    message: '',
    fieldErrors: [],
  });
});

test('ApiEaseCreateRequestContractValidator validate should reject unsupported top-level fields with field paths', async () => {
  // Arrange
  const { ApiEaseCreateRequestContractValidator } = await import(validatorModuleUrl);
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();
  const payload = {
    type: 'http',
    method: 'GET',
    address: 'https://example.com/orders',
    body: {
      orderId: '1',
    },
    shopId: 'gid://shopify/Shop/1',
  };

  // Act
  const result = apiEaseCreateRequestContractValidator.validate(payload);

  // Assert
  assert.equal(result.isValid, false);
  assert.equal(result.errorCode, 'INVALID_REQUEST_CREATE_CONTRACT');
  assert.equal(result.message, 'Request create payload is invalid');
  assert.deepEqual(result.fieldErrors, [
    {
      path: 'body',
      code: 'UNSUPPORTED_FIELD',
      message: 'Field is not supported',
    },
    {
      path: 'shopId',
      code: 'UNSUPPORTED_FIELD',
      message: 'Field is not supported',
    },
  ]);
});

test('ApiEaseCreateRequestContractValidator validate should require type-specific fields for liquid and system requests', async () => {
  // Arrange
  const { ApiEaseCreateRequestContractValidator } = await import(validatorModuleUrl);
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();

  // Act
  const liquidResult = apiEaseCreateRequestContractValidator.validate({
    type: 'liquid',
  });
  const systemResult = apiEaseCreateRequestContractValidator.validate({
    type: 'system',
    parameters: [],
  });

  // Assert
  assert.deepEqual(liquidResult.fieldErrors, [
    {
      path: 'liquid',
      code: 'REQUIRED',
      message: 'Field is required',
    },
  ]);
  assert.deepEqual(systemResult.fieldErrors, [
    {
      path: 'parameters',
      code: 'MIN_ITEMS',
      message: 'At least 1 item is required',
    },
  ]);
});

test('ApiEaseCreateRequestContractValidator validate should report invalid nested parameter and trigger fields by path', async () => {
  // Arrange
  const { ApiEaseCreateRequestContractValidator } = await import(validatorModuleUrl);
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();
  const payload = {
    type: 'http',
    method: 'GET',
    address: 'https://example.com/orders',
    parameters: [
      {
        type: 'header',
        value: 'application/json',
      },
    ],
    triggers: [
      {
        type: 'proxyEndpoint',
        proxyEndpoint: {
          path: '',
          method: 'GET',
          authenticated: true,
        },
      },
    ],
  };

  // Act
  const result = apiEaseCreateRequestContractValidator.validate(payload);

  // Assert
  assert.deepEqual(result.fieldErrors, [
    {
      path: 'parameters[0].name',
      code: 'REQUIRED',
      message: 'Field is required',
    },
    {
      path: 'triggers[0].proxyEndpoint.path',
      code: 'MIN_LENGTH',
      message: 'Must not be empty',
    },
  ]);
});
