const RESOURCE_PATH_PREFIX = 'api/v1/resources';
const DEFAULT_RESOURCE_DEFINITIONS = Object.freeze([
  Object.freeze({
    resourceName: 'request',
    apiPathSegment: 'requests',
    responsePayloadKey: 'request',
    humanReadableLabel: 'Request',
    identifierOptionName: '--request-handle',
    identifierValueName: 'handle',
    legacyIdentifierOptions: Object.freeze([
      Object.freeze({
        optionName: '--request-id',
        valueName: 'id-or-handle',
      }),
    ]),
    identifierOutputProperties: Object.freeze([
      Object.freeze({
        propertyName: 'handle',
        valueName: 'handle',
      }),
      Object.freeze({
        propertyName: 'id',
        valueName: 'id',
      }),
    ]),
  }),
  Object.freeze({
    resourceName: 'widget',
    apiPathSegment: 'widgets',
    responsePayloadKey: 'widget',
    humanReadableLabel: 'Widget',
    identifierOptionName: '--widget-handle',
    identifierValueName: 'handle',
    legacyIdentifierOptions: Object.freeze([
      Object.freeze({
        optionName: '--widget-id',
        valueName: 'id-or-handle',
      }),
    ]),
    identifierOutputProperties: Object.freeze([
      Object.freeze({
        propertyName: 'handle',
        valueName: 'handle',
      }),
      Object.freeze({
        propertyName: 'widgetHandle',
        valueName: 'handle',
      }),
      Object.freeze({
        propertyName: 'id',
        valueName: 'id',
      }),
      Object.freeze({
        propertyName: 'widgetId',
        valueName: 'id',
      }),
    ]),
  }),
  Object.freeze({
    resourceName: 'variable',
    apiPathSegment: 'variables',
    responsePayloadKey: 'variable',
    humanReadableLabel: 'Variable',
    identifierOptionName: '--variable-handle',
    identifierValueName: 'handle',
    legacyIdentifierOptions: Object.freeze([
      Object.freeze({
        optionName: '--variable-name',
        valueName: 'name-or-handle',
      }),
    ]),
    identifierOutputProperties: Object.freeze([
      Object.freeze({
        propertyName: 'handle',
        valueName: 'handle',
      }),
      Object.freeze({
        propertyName: 'id',
        valueName: 'id',
      }),
      Object.freeze({
        propertyName: 'name',
        valueName: 'name',
      }),
    ]),
  }),
  Object.freeze({
    resourceName: 'function',
    apiPathSegment: 'functions',
    responsePayloadKey: 'function',
    humanReadableLabel: 'Function',
    identifierOptionName: '--function-handle',
    identifierValueName: 'handle',
    legacyIdentifierOptions: Object.freeze([
      Object.freeze({
        optionName: '--function-id',
        valueName: 'id-or-handle',
      }),
    ]),
    identifierOutputProperties: Object.freeze([
      Object.freeze({
        propertyName: 'handle',
        valueName: 'handle',
      }),
      Object.freeze({
        propertyName: 'id',
        valueName: 'id',
      }),
      Object.freeze({
        propertyName: 'functionId',
        valueName: 'id',
      }),
    ]),
  }),
]);

class CrudResourceDefinitionCollection {
  constructor({ resourceDefinitions = DEFAULT_RESOURCE_DEFINITIONS } = {}) {
    this.resourceDefinitions = resourceDefinitions;
  }

  listSupportedResourceNames() {
    return this.resourceDefinitions.map((resourceDefinition) => resourceDefinition.resourceName);
  }

  findResourceDefinition(resourceName) {
    return this.resourceDefinitions.find(
      (resourceDefinition) => resourceDefinition.resourceName === resourceName,
    ) || null;
  }

  readResourceDefinition(resourceName) {
    const resourceDefinition = this.findResourceDefinition(resourceName);
    if (resourceDefinition) {
      return resourceDefinition;
    }

    throw new Error(this.buildUnsupportedResourceMessage(resourceName));
  }

  listIdentifierOptionNames(crudResourceDefinition) {
    return [
      crudResourceDefinition.identifierOptionName,
      ...crudResourceDefinition.legacyIdentifierOptions.map(
        (legacyIdentifierOption) => legacyIdentifierOption.optionName,
      ),
    ];
  }

  buildCollectionPath(resourceName) {
    const resourceDefinition = this.readResourceDefinition(resourceName);
    return `${RESOURCE_PATH_PREFIX}/${resourceDefinition.apiPathSegment}`;
  }

  buildItemPath({ resourceName, resourceIdentifier }) {
    const collectionPath = this.buildCollectionPath(resourceName);
    return `${collectionPath}/${encodeURIComponent(resourceIdentifier)}`;
  }

  buildUnsupportedResourceMessage(resourceName) {
    return `Unsupported CRUD resource: ${resourceName}. Supported resources: ${this.listSupportedResourceNames().join(', ')}`;
  }
}

export { CrudResourceDefinitionCollection };
