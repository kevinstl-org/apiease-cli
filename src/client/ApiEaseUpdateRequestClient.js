import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';
import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';
import { ApiEaseWebhookEventService } from './ApiEaseWebhookEventService.js';

const REQUEST_RESOURCE_NAME = 'request';
const INVALID_REQUEST_STATUS = 422;
const REQUEST_UPDATE_FAILED = 'REQUEST_UPDATE_FAILED';

class ApiEaseUpdateRequestClient {
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

  async updateRequest({ apiBaseUrl, apiKey, shopDomain, requestId, request } = {}) {
    const normalizedRequest = this.apiEaseWebhookEventService.normalizeRequestWebhookEvents(request);
    const validationResult = this.apiEaseCreateRequestContractValidator.validate(normalizedRequest);
    if (!validationResult.isValid) {
      return this.buildValidationFailureResult(validationResult);
    }

    return await this.apiEaseCrudResourceClient.updateResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: requestId,
      resource: normalizedRequest,
      failureErrorCode: REQUEST_UPDATE_FAILED,
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

export { ApiEaseUpdateRequestClient };
