const READ_REQUEST_PATH = 'api/v1/resources/requests';
const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_FAILURE_STATUS = 500;
const REQUEST_READ_FAILED = 'REQUEST_READ_FAILED';

class ApiEaseReadRequestClient {
  constructor({ fetchImplementation = globalThis.fetch } = {}) {
    this.fetchImplementation = fetchImplementation;
  }

  async readRequest({ apiBaseUrl, apiKey, shopDomain, requestId } = {}) {
    try {
      const response = await this.fetchImplementation(
        this.buildReadRequestUrl({ apiBaseUrl, requestId }),
        {
          method: 'GET',
          headers: this.buildRequestHeaders({ apiKey, shopDomain }),
        },
      );
      return await this.buildResponseResult(response);
    } catch (error) {
      return this.buildTransportFailureResult(error);
    }
  }

  buildReadRequestUrl({ apiBaseUrl, requestId }) {
    return new URL(this.buildReadRequestPath(requestId), this.buildNormalizedBaseUrl(apiBaseUrl)).toString();
  }

  buildReadRequestPath(requestId) {
    return `${READ_REQUEST_PATH}/${encodeURIComponent(requestId)}`;
  }

  buildNormalizedBaseUrl(apiBaseUrl) {
    return apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  }

  buildRequestHeaders({ apiKey, shopDomain }) {
    return {
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
      errorCode: REQUEST_READ_FAILED,
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
      errorCode: REQUEST_READ_FAILED,
      message: error.message,
      fieldErrors: [],
    };
  }
}

export { ApiEaseReadRequestClient };
