import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';
import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';
import { ApiEaseHandleBasedCreateOrUpdateService } from './ApiEaseHandleBasedCreateOrUpdateService.js';
import { ApiEaseWebhookEventService } from './ApiEaseWebhookEventService.js';

const REQUEST_RESOURCE_NAME = 'request';
const INVALID_REQUEST_STATUS = 422;
const REQUEST_CREATE_FAILED = 'REQUEST_CREATE_FAILED';
const REQUEST_READ_FAILED = 'REQUEST_READ_FAILED';
const REQUEST_UPDATE_FAILED = 'REQUEST_UPDATE_FAILED';
const CREATED_OPERATION = 'created';

class ApiEaseCreateRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseWebhookEventService = new ApiEaseWebhookEventService(),
    apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator(),
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({ fetchImplementation }),
    apiEaseHandleBasedCreateOrUpdateService = new ApiEaseHandleBasedCreateOrUpdateService({
      apiEaseCrudResourceClient,
    }),
  } = {}) {
    this.apiEaseWebhookEventService = apiEaseWebhookEventService;
    this.apiEaseCreateRequestContractValidator = apiEaseCreateRequestContractValidator;
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
    this.apiEaseHandleBasedCreateOrUpdateService = apiEaseHandleBasedCreateOrUpdateService;
  }

  async createRequest({ apiBaseUrl, apiKey, shopDomain, request } = {}) {
    const normalizedRequest = this.apiEaseWebhookEventService.normalizeRequestWebhookEvents(request);
    const validationResult = this.apiEaseCreateRequestContractValidator.validate(normalizedRequest);
    if (!validationResult.isValid) {
      return this.buildValidationFailureResult(validationResult);
    }

    if (normalizedRequest.handle) {
      return await this.createOrUpdateHandledRequest({
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

  async createOrUpdateHandledRequest({ apiBaseUrl, apiKey, shopDomain, request }) {
    return await this.apiEaseHandleBasedCreateOrUpdateService.createOrUpdateResourceByHandle({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceHandle: request.handle,
      resource: request,
      readFailureErrorCode: REQUEST_READ_FAILED,
      createFailureErrorCode: REQUEST_CREATE_FAILED,
      updateFailureErrorCode: REQUEST_UPDATE_FAILED,
    });
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
