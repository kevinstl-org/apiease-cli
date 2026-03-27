import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';
import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';

const REQUEST_RESOURCE_NAME = 'request';
const INVALID_REQUEST_STATUS = 422;
const REQUEST_UPDATE_FAILED = 'REQUEST_UPDATE_FAILED';

class ApiEaseUpdateRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator(),
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({ fetchImplementation }),
  } = {}) {
    this.apiEaseCreateRequestContractValidator = apiEaseCreateRequestContractValidator;
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
  }

  async updateRequest({ apiBaseUrl, apiKey, shopDomain, requestId, request } = {}) {
    const validationResult = this.apiEaseCreateRequestContractValidator.validate(request);
    if (!validationResult.isValid) {
      return this.buildValidationFailureResult(validationResult);
    }

    return await this.apiEaseCrudResourceClient.updateResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: requestId,
      resource: request,
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
