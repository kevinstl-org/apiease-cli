import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';
import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';
import { ApiEaseWebhookEventService } from './ApiEaseWebhookEventService.js';

const REQUEST_RESOURCE_NAME = 'request';
const INVALID_REQUEST_STATUS = 422;
const REQUEST_CREATE_FAILED = 'REQUEST_CREATE_FAILED';

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

    return await this.apiEaseCrudResourceClient.createResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resource: normalizedRequest,
      failureErrorCode: REQUEST_CREATE_FAILED,
    });
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
