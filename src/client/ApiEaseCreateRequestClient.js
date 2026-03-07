import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';

const CREATE_REQUEST_PATH = 'api/programmatic/requests';
const JSON_CONTENT_TYPE = 'application/json';
const INVALID_REQUEST_STATUS = 422;
const DEFAULT_FAILURE_STATUS = 500;
const REQUEST_CREATE_FAILED = 'REQUEST_CREATE_FAILED';

class ApiEaseCreateRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator(),
  } = {}) {
    this.fetchImplementation = fetchImplementation;
    this.apiEaseCreateRequestContractValidator = apiEaseCreateRequestContractValidator;
  }

  async createRequest({ apiBaseUrl, apiKey, shopDomain, request } = {}) {
    const validationResult = this.apiEaseCreateRequestContractValidator.validate(request);
    if (!validationResult.isValid) {
      return this.buildValidationFailureResult(validationResult);
    }

    try {
      const response = await this.fetchImplementation(this.buildCreateRequestUrl(apiBaseUrl), {
        method: 'POST',
        headers: this.buildRequestHeaders({ apiKey, shopDomain }),
        body: JSON.stringify(request),
      });
      return await this.buildResponseResult(response);
    } catch (error) {
      return this.buildTransportFailureResult(error);
    }
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

  buildCreateRequestUrl(apiBaseUrl) {
    return new URL(CREATE_REQUEST_PATH, this.buildNormalizedBaseUrl(apiBaseUrl)).toString();
  }

  buildNormalizedBaseUrl(apiBaseUrl) {
    return apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  }

  buildRequestHeaders({ apiKey, shopDomain }) {
    return {
      'content-type': JSON_CONTENT_TYPE,
      'x-apiease-api-key': apiKey,
      'x-shop-myshopify-domain': shopDomain,
    };
  }

  async buildResponseResult(response) {
    const payload = await response.json();
    return {
      status: response.status,
      ...payload,
    };
  }

  buildTransportFailureResult(error) {
    return {
      status: DEFAULT_FAILURE_STATUS,
      ok: false,
      errorCode: REQUEST_CREATE_FAILED,
      message: error.message,
      fieldErrors: [],
    };
  }
}

export { ApiEaseCreateRequestClient };
