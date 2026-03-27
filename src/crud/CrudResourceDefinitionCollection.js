const RESOURCE_PATH_PREFIX = 'api/v1/resources';
const DEFAULT_RESOURCE_DEFINITIONS = Object.freeze([
  Object.freeze({
    resourceName: 'request',
    apiPathSegment: 'requests',
    responsePayloadKey: 'request',
    humanReadableLabel: 'Request',
    identifierOptionName: '--request-id',
    identifierValueName: 'id',
    identifierPropertyName: 'id',
  }),
  Object.freeze({
    resourceName: 'widget',
    apiPathSegment: 'widgets',
    responsePayloadKey: 'widget',
    humanReadableLabel: 'Widget',
    identifierOptionName: '--widget-id',
    identifierValueName: 'id',
    identifierPropertyName: 'widgetId',
  }),
  Object.freeze({
    resourceName: 'variable',
    apiPathSegment: 'variables',
    responsePayloadKey: 'variable',
    humanReadableLabel: 'Variable',
    identifierOptionName: '--variable-name',
    identifierValueName: 'name',
    identifierPropertyName: 'name',
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
