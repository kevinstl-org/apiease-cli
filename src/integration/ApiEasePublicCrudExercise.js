import { randomUUID } from 'node:crypto';

class ApiEasePublicCrudExercise {
  constructor({
    apiBaseUrl,
    apiKey,
    shopDomain,
    fetchImplementation = globalThis.fetch,
    exerciseIdProvider = () => randomUUID(),
    stepReporter = () => {},
  } = {}) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    this.shopDomain = shopDomain;
    this.fetchImplementation = fetchImplementation;
    this.exerciseId = exerciseIdProvider();
    this.stepReporter = stepReporter;
  }

  async run() {
    this.createdResources = {
      request: null,
      widget: null,
      shopVariable: null,
    };

    const result = {
      exerciseId: this.exerciseId,
      request: this.createdResources.request,
      widget: this.createdResources.widget,
      shopVariable: this.createdResources.shopVariable,
      cleanupResults: [],
    };
    let exerciseError = null;

    try {
      result.request = await this.exerciseRequestCrud();
      this.createdResources.request = result.request;
      result.widget = await this.exerciseWidgetCrud();
      this.createdResources.widget = result.widget;
      result.shopVariable = await this.exerciseShopVariableCrud();
      this.createdResources.shopVariable = result.shopVariable;
    } catch (error) {
      exerciseError = error;
    }

    result.cleanupResults = await this.cleanupCreatedResources(result);
    const cleanupFailure = this.buildCleanupFailure(result.cleanupResults);

    if (exerciseError) {
      exerciseError.cleanupResults = result.cleanupResults;
      if (cleanupFailure) {
        exerciseError.cleanupFailure = cleanupFailure;
      }
      throw exerciseError;
    }

    if (cleanupFailure) {
      throw cleanupFailure;
    }

    return result;
  }

  async exerciseRequestCrud() {
    this.reportStep(`Creating request for exercise ${this.exerciseId}`);
    const createPayload = await this.requestJson({
      method: 'POST',
      path: this.buildRequestCollectionPath(),
      body: this.buildCreateRequestPayload(),
    });
    const requestId = this.readRequiredIdentifier({
      resourceType: 'request',
      resourceObject: createPayload.request,
      identifierKey: 'id',
    });
    this.createdResources.request = {
      requestId,
      createdRequest: createPayload.request,
      updatedRequest: null,
    };

    this.reportStep(`Listing requests for exercise ${this.exerciseId}`);
    const listPayload = await this.requestJson({
      method: 'GET',
      path: this.buildRequestCollectionPath(),
    });
    this.assertCollectionContains({
      collection: listPayload.requests,
      identifierKey: 'id',
      identifierValue: requestId,
      resourceType: 'request',
    });

    this.reportStep(`Reading request ${requestId}`);
    await this.requestJson({
      method: 'GET',
      path: this.buildRequestItemPath(requestId),
    });

    this.reportStep(`Updating request ${requestId}`);
    const updatePayload = await this.requestJson({
      method: 'PUT',
      path: this.buildRequestItemPath(requestId),
      body: this.buildUpdateRequestPayload(),
    });

    this.createdResources.request.updatedRequest = updatePayload.request;
    return this.createdResources.request;
  }

  async exerciseWidgetCrud() {
    this.reportStep(`Creating widget for exercise ${this.exerciseId}`);
    const createPayload = await this.requestJson({
      method: 'POST',
      path: this.buildWidgetCollectionPath(),
      body: this.buildCreateWidgetPayload(),
    });
    const widgetId = this.readRequiredIdentifier({
      resourceType: 'widget',
      resourceObject: createPayload.widget,
      identifierKey: 'widgetId',
    });
    const widgetHandle = this.readRequiredIdentifier({
      resourceType: 'widget',
      resourceObject: createPayload.widget,
      identifierKey: 'widgetHandle',
    });
    this.createdResources.widget = {
      widgetId,
      widgetHandle,
      createdWidget: createPayload.widget,
      updatedWidget: null,
    };

    this.reportStep(`Listing widgets for exercise ${this.exerciseId}`);
    const listPayload = await this.requestJson({
      method: 'GET',
      path: this.buildWidgetCollectionPath(),
    });
    this.assertCollectionContains({
      collection: listPayload.widgets,
      identifierKey: 'widgetId',
      identifierValue: widgetId,
      resourceType: 'widget',
    });

    this.reportStep(`Reading widget ${widgetId}`);
    await this.requestJson({
      method: 'GET',
      path: this.buildWidgetItemPath(widgetId),
    });

    this.reportStep(`Updating widget ${widgetId}`);
    const updatePayload = await this.requestJson({
      method: 'PUT',
      path: this.buildWidgetItemPath(widgetId),
      body: this.buildUpdateWidgetPayload(widgetHandle),
    });

    this.createdResources.widget.updatedWidget = updatePayload.widget;
    return this.createdResources.widget;
  }

  async exerciseShopVariableCrud() {
    const variableName = this.buildShopVariableName();

    this.reportStep(`Creating shop variable ${variableName}`);
    const createPayload = await this.requestJson({
      method: 'POST',
      path: this.buildShopVariableCollectionPath(),
      body: this.buildCreateShopVariablePayload(variableName),
    });
    this.createdResources.shopVariable = {
      variableName,
      createdShopVariable: createPayload.shopVariable,
      updatedShopVariable: null,
    };

    this.reportStep(`Listing shop variables for exercise ${this.exerciseId}`);
    const listPayload = await this.requestJson({
      method: 'GET',
      path: this.buildShopVariableCollectionPath(),
    });
    this.assertCollectionContains({
      collection: listPayload.shopVariables,
      identifierKey: 'name',
      identifierValue: variableName,
      resourceType: 'shop variable',
    });

    this.reportStep(`Reading shop variable ${variableName}`);
    await this.requestJson({
      method: 'GET',
      path: this.buildShopVariableItemPath(variableName),
    });

    this.reportStep(`Updating shop variable ${variableName}`);
    const updatePayload = await this.requestJson({
      method: 'PUT',
      path: this.buildShopVariableItemPath(variableName),
      body: this.buildUpdateShopVariablePayload(),
    });

    this.createdResources.shopVariable.updatedShopVariable = updatePayload.shopVariable;
    return this.createdResources.shopVariable;
  }

  async cleanupCreatedResources(result) {
    const shopVariableName = this.createdResources.shopVariable?.variableName
      || result.shopVariable?.variableName
      || '';
    const widgetId = this.createdResources.widget?.widgetId || result.widget?.widgetId || '';
    const requestId = this.createdResources.request?.requestId || result.request?.requestId || '';

    const cleanupTargets = [
      this.buildCleanupTarget({
        resourceType: 'shopVariable',
        identifierValue: shopVariableName,
        path: shopVariableName ? this.buildShopVariableItemPath(shopVariableName) : '',
      }),
      this.buildCleanupTarget({
        resourceType: 'widget',
        identifierValue: widgetId,
        path: widgetId ? this.buildWidgetItemPath(widgetId) : '',
      }),
      this.buildCleanupTarget({
        resourceType: 'request',
        identifierValue: requestId,
        path: requestId ? this.buildRequestItemPath(requestId) : '',
      }),
    ];

    const cleanupResults = [];
    for (const cleanupTarget of cleanupTargets) {
      const cleanupResult = await this.cleanupResource(cleanupTarget);
      if (cleanupResult) {
        cleanupResults.push(cleanupResult);
      }
    }

    return cleanupResults;
  }

  buildCleanupTarget({ resourceType, identifierValue, path }) {
    return {
      resourceType,
      identifierValue,
      path,
    };
  }

  async cleanupResource(cleanupTarget) {
    if (!cleanupTarget.identifierValue) {
      return null;
    }

    this.reportStep(`Deleting ${cleanupTarget.resourceType} ${cleanupTarget.identifierValue}`);
    try {
      const payload = await this.requestJson({
        method: 'DELETE',
        path: cleanupTarget.path,
      });
      return {
        resourceType: cleanupTarget.resourceType,
        identifierValue: cleanupTarget.identifierValue,
        isSuccess: true,
        payload,
      };
    } catch (error) {
      if (error.status === 404) {
        return {
          resourceType: cleanupTarget.resourceType,
          identifierValue: cleanupTarget.identifierValue,
          isSuccess: true,
          wasAlreadyDeleted: true,
        };
      }

      return {
        resourceType: cleanupTarget.resourceType,
        identifierValue: cleanupTarget.identifierValue,
        isSuccess: false,
        errorCode: error.errorCode,
        message: error.message,
      };
    }
  }

  buildCleanupFailure(cleanupResults) {
    const failedCleanupResults = cleanupResults.filter((cleanupResult) => !cleanupResult.isSuccess);
    if (failedCleanupResults.length === 0) {
      return null;
    }

    return new Error(
      `Cleanup failed for ${failedCleanupResults
        .map((cleanupResult) => cleanupResult.resourceType)
        .join(', ')}`,
    );
  }

  async requestJson({ method, path, body }) {
    const options = {
      method,
      headers: this.buildHeaders(body),
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await this.fetchImplementation(this.buildUrl(path), options);
    const payload = await response.json();
    const status = response.status;
    const isSuccessfulStatus = status >= 200 && status < 300;
    if (!isSuccessfulStatus || payload?.ok === false) {
      throw this.buildApiError({ method, path, status, payload });
    }

    return payload;
  }

  buildHeaders(body) {
    const headers = {
      'x-apiease-api-key': this.apiKey,
      'x-shop-myshopify-domain': this.shopDomain,
    };
    if (body !== undefined) {
      headers['content-type'] = 'application/json';
    }

    return headers;
  }

  buildUrl(path) {
    return new URL(path, this.buildNormalizedBaseUrl()).toString();
  }

  buildNormalizedBaseUrl() {
    return this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl : `${this.apiBaseUrl}/`;
  }

  buildApiError({ method, path, status, payload }) {
    const error = new Error(payload?.message || `Request failed for ${method} ${path}`);
    error.status = status;
    error.errorCode = payload?.errorCode || 'PUBLIC_CRUD_EXERCISE_FAILED';
    error.payload = payload;
    error.method = method;
    error.path = path;
    return error;
  }

  assertCollectionContains({ collection, identifierKey, identifierValue, resourceType }) {
    const containsIdentifier = Array.isArray(collection)
      && collection.some((resourceObject) => resourceObject?.[identifierKey] === identifierValue);
    if (!containsIdentifier) {
      throw new Error(`Expected ${resourceType} collection to contain ${identifierValue}`);
    }
  }

  readRequiredIdentifier({ resourceType, resourceObject, identifierKey }) {
    const identifierValue = resourceObject?.[identifierKey];
    if (typeof identifierValue === 'string' && identifierValue.length > 0) {
      return identifierValue;
    }

    throw new Error(`Expected ${resourceType} response to include ${identifierKey}`);
  }

  buildRequestCollectionPath() {
    return 'api/v1/resources/requests';
  }

  buildRequestItemPath(requestId) {
    return `api/v1/resources/requests/${encodeURIComponent(requestId)}`;
  }

  buildWidgetCollectionPath() {
    return 'api/v1/resources/widgets';
  }

  buildWidgetItemPath(widgetId) {
    return `api/v1/resources/widgets/${encodeURIComponent(widgetId)}`;
  }

  buildShopVariableCollectionPath() {
    return 'api/v1/resources/shopVariables';
  }

  buildShopVariableItemPath(variableName) {
    return `api/v1/resources/shopVariables/${encodeURIComponent(variableName)}`;
  }

  buildCreateRequestPayload() {
    return {
      name: `Codex Request ${this.exerciseId}`,
      type: 'http',
      method: 'GET',
      address: `https://example.com/codex/request/${encodeURIComponent(this.exerciseId)}`,
    };
  }

  buildUpdateRequestPayload() {
    return {
      name: `Codex Request Updated ${this.exerciseId}`,
      type: 'http',
      method: 'POST',
      address: `https://example.com/codex/request/${encodeURIComponent(this.exerciseId)}/updated`,
    };
  }

  buildCreateWidgetPayload() {
    return {
      widgetName: `Codex Widget ${this.exerciseId}`,
      liquid: `<section>${this.exerciseId}</section>`,
      javascript: `console.log("${this.exerciseId}");`,
    };
  }

  buildUpdateWidgetPayload(widgetHandle) {
    return {
      widgetHandle,
      widgetName: `Codex Widget Updated ${this.exerciseId}`,
      liquid: `<section>updated ${this.exerciseId}</section>`,
      javascript: `console.log("updated-${this.exerciseId}");`,
    };
  }

  buildCreateShopVariablePayload(variableName) {
    return {
      name: variableName,
      value: `value-${this.exerciseId}`,
      sensitive: true,
    };
  }

  buildUpdateShopVariablePayload() {
    return {
      value: `updated-value-${this.exerciseId}`,
      sensitive: false,
    };
  }

  buildShopVariableName() {
    return `codex_variable_${this.buildNormalizedIdentifier(this.exerciseId)}`;
  }

  buildNormalizedIdentifier(identifierValue) {
    return String(identifierValue).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  reportStep(message) {
    this.stepReporter(message);
  }
}

export { ApiEasePublicCrudExercise };
