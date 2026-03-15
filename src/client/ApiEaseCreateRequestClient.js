import { ApiEaseCreateRequestContractValidator } from './ApiEaseCreateRequestContractValidator.js';

const CREATE_REQUEST_PATH = 'api/v1/resources/requests';
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
    const responseContentType = this.readResponseContentType(response);
    if (responseContentType && !this.isJsonContentType(responseContentType)) {
      return await this.buildNonJsonFailureResult({
        response,
        responseContentType,
      });
    }

    const payload = await response.json();
    return {
      status: response.status,
      ...payload,
    };
  }

  readResponseContentType(response) {
    return response?.headers?.get?.('content-type') || '';
  }

  isJsonContentType(responseContentType) {
    return responseContentType.toLowerCase().includes(JSON_CONTENT_TYPE);
  }

  async buildNonJsonFailureResult({ response, responseContentType }) {
    return {
      status: response?.status || DEFAULT_FAILURE_STATUS,
      ok: false,
      errorCode: REQUEST_CREATE_FAILED,
      message: this.buildNonJsonFailureMessage({
        responseStatus: response?.status,
        responseContentType,
        responseBody: await this.readResponseText(response),
      }),
      fieldErrors: [],
    };
  }

  async readResponseText(response) {
    if (typeof response?.text !== 'function') {
      return '';
    }

    return await response.text();
  }

  buildNonJsonFailureMessage({ responseStatus, responseContentType, responseBody }) {
    const normalizedContentType = responseContentType.split(';')[0] || 'unknown';
    const responsePreview = this.buildResponsePreview(responseBody);
    return `API returned a non-JSON response with status ${responseStatus || DEFAULT_FAILURE_STATUS} and content-type ${normalizedContentType}; response starts with ${responsePreview}`;
  }

  buildResponsePreview(responseBody) {
    const normalizedResponseBody = String(responseBody || '').replace(/\s+/g, ' ').trim();
    if (normalizedResponseBody.length === 0) {
      return '(empty body)';
    }

    return normalizedResponseBody.slice(0, 120);
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
