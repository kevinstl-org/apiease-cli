import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';
import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';
import { ApiEaseWebhookEventService } from './ApiEaseWebhookEventService.js';

const REQUEST_RESOURCE_NAME = 'request';
const INVALID_REQUEST_STATUS = 422;
const REQUEST_CREATE_FAILED = 'REQUEST_CREATE_FAILED';
const REQUEST_READ_FAILED = 'REQUEST_READ_FAILED';
const REQUEST_UPDATE_FAILED = 'REQUEST_UPDATE_FAILED';
const NOT_FOUND_STATUS = 404;
const CREATED_OPERATION = 'created';
const UPDATED_OPERATION = 'updated';

class ApiEaseCreateRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseWebhookEventService = new ApiEaseWebhookEventService(),
    apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator(),
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({ fetchImplementation }),
  } = {}) {
    this.apiEaseWebhookEventService = apiEaseWebhookEventService;
    this.apiEaseCreateRequestContractValidator = apiEaseCreateRequestContractValidator;
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
  }

  async createRequest({ apiBaseUrl, apiKey, shopDomain, request } = {}) {
    const normalizedRequest = this.apiEaseWebhookEventService.normalizeRequestWebhookEvents(request);
    const validationResult = this.apiEaseCreateRequestContractValidator.validate(normalizedRequest);
    if (!validationResult.isValid) {
      return this.buildValidationFailureResult(validationResult);
    }

    if (normalizedRequest.handle) {
      return await this.createOrUpdateRequestByHandle({
        apiBaseUrl,
        apiKey,
        shopDomain,
        request: normalizedRequest,
      });
    }

    return await this.createNewRequest({
      apiBaseUrl,
      apiKey,
      shopDomain,
      request: normalizedRequest,
    });
  }

  async createOrUpdateRequestByHandle({ apiBaseUrl, apiKey, shopDomain, request }) {
    const lookupResult = await this.apiEaseCrudResourceClient.readResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: request.handle,
      failureErrorCode: REQUEST_READ_FAILED,
    });

    if (lookupResult.ok) {
      return await this.updateExistingRequest({
        apiBaseUrl,
        apiKey,
        shopDomain,
        request,
      });
    }

    if (lookupResult.status === NOT_FOUND_STATUS) {
      return await this.createNewRequest({
        apiBaseUrl,
        apiKey,
        shopDomain,
        request,
      });
    }

    return lookupResult;
  }

  async createNewRequest({ apiBaseUrl, apiKey, shopDomain, request }) {
    const result = await this.apiEaseCrudResourceClient.createResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resource: request,
      failureErrorCode: REQUEST_CREATE_FAILED,
    });

    return this.addOperationToSuccessfulResult(result, CREATED_OPERATION);
  }

  async updateExistingRequest({ apiBaseUrl, apiKey, shopDomain, request }) {
    const result = await this.apiEaseCrudResourceClient.updateResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: request.handle,
      resource: request,
      failureErrorCode: REQUEST_UPDATE_FAILED,
    });

    return this.addOperationToSuccessfulResult(result, UPDATED_OPERATION);
  }

  addOperationToSuccessfulResult(result, operation) {
    if (!result.ok) {
      return result;
    }

    return {
      ...result,
      operation,
    };
  }

  buildValidationFailureResult(validationResult) {
    return {
      status: INVALID_REQUEST_STATUS,
      ok: false,
      errorCode: validationResult.errorCode,
      message: validationResult.message,
      fieldErrors: validationResult.fieldErrors,
    };
  }
}

export { ApiEaseCreateRequestClient };
