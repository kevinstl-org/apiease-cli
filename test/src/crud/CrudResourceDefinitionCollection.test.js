import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const crudResourceDefinitionCollectionModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'crud', 'CrudResourceDefinitionCollection.js'),
).href;

describe('CrudResourceDefinitionCollection', () => {
  describe('constructor', () => {
    it('should be constructible for shared cli and client resource lookups', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);

      // Act
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Assert
      assert.ok(crudResourceDefinitionCollection instanceof CrudResourceDefinitionCollection);
    });
  });

  describe('listSupportedResourceNames', () => {
    it('should return the supported request widget and variable resource names', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.listSupportedResourceNames();

      // Assert
      assert.deepEqual(result, ['request', 'widget', 'variable']);
    });
  });

  describe('readResourceDefinition', () => {
    it('should return the request resource definition metadata', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.readResourceDefinition('request');

      // Assert
      assert.deepEqual(result, {
        resourceName: 'request',
        apiPathSegment: 'requests',
        responsePayloadKey: 'request',
        humanReadableLabel: 'Request',
        identifierOptionName: '--request-id',
        identifierValueName: 'id',
        identifierPropertyName: 'id',
      });
    });

    it('should return the widget resource definition metadata', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.readResourceDefinition('widget');

      // Assert
      assert.deepEqual(result, {
        resourceName: 'widget',
        apiPathSegment: 'widgets',
        responsePayloadKey: 'widget',
        humanReadableLabel: 'Widget',
        identifierOptionName: '--widget-id',
        identifierValueName: 'id',
        identifierPropertyName: 'widgetId',
      });
    });

    it('should return the variable resource definition metadata', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.readResourceDefinition('variable');

      // Assert
      assert.deepEqual(result, {
        resourceName: 'variable',
        apiPathSegment: 'variables',
        responsePayloadKey: 'variable',
        humanReadableLabel: 'Variable',
        identifierOptionName: '--variable-name',
        identifierValueName: 'name',
        identifierPropertyName: 'name',
      });
    });

    it('should throw for an unsupported resource name', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const readResourceDefinition = () => crudResourceDefinitionCollection.readResourceDefinition('product');

      // Assert
      assert.throws(
        readResourceDefinition,
        new Error('Unsupported CRUD resource: product. Supported resources: request, widget, variable'),
      );
    });
  });

  describe('findResourceDefinition', () => {
    it('should return null for an unsupported resource name', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.findResourceDefinition('product');

      // Assert
      assert.equal(result, null);
    });
  });

  describe('buildCollectionPath', () => {
    it('should build the versioned collection path for a supported resource', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.buildCollectionPath('widget');

      // Assert
      assert.equal(result, 'api/v1/resources/widgets');
    });
  });

  describe('buildItemPath', () => {
    it('should build the versioned item path with an encoded resource identifier', async () => {
      // Arrange
      const { CrudResourceDefinitionCollection } = await import(crudResourceDefinitionCollectionModuleUrl);
      const crudResourceDefinitionCollection = new CrudResourceDefinitionCollection();

      // Act
      const result = crudResourceDefinitionCollection.buildItemPath({
        resourceName: 'request',
        resourceIdentifier: 'request/1 & 2',
      });

      // Assert
      assert.equal(result, 'api/v1/resources/requests/request%2F1%20%26%202');
    });
  });
});
