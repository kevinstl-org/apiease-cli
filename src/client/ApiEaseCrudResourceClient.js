import { CrudResourceDefinitionCollection } from '../crud/CrudResourceDefinitionCollection.js';

const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_FAILURE_STATUS = 500;

class ApiEaseCrudResourceClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    crudResourceDefinitionCollection = new CrudResourceDefinitionCollection(),
  } = {}) {
    this.fetchImplementation = fetchImplementation;
    this.crudResourceDefinitionCollection = crudResourceDefinitionCollection;
  }

  async createResource({
    resourceName,
    apiBaseUrl,
    apiKey,
    shopDomain,
    resource,
    failureErrorCode,
  } = {}) {
    return await this.sendResourceRequest({
      method: 'POST',
      resourceName,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resource,
      failureErrorCode,
    });
  }

  async readResource({
    resourceName,
    apiBaseUrl,
    apiKey,
    shopDomain,
    resourceIdentifier,
    failureErrorCode,
  } = {}) {
    return await this.sendResourceRequest({
      method: 'GET',
      resourceName,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier,
      failureErrorCode,
    });
  }

  async updateResource({
    resourceName,
    apiBaseUrl,
    apiKey,
    shopDomain,
    resourceIdentifier,
    resource,
    failureErrorCode,
  } = {}) {
    return await this.sendResourceRequest({
      method: 'PUT',
      resourceName,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier,
      resource,
      failureErrorCode,
    });
  }

  async deleteResource({
    resourceName,
    apiBaseUrl,
    apiKey,
    shopDomain,
    resourceIdentifier,
    failureErrorCode,
  } = {}) {
    return await this.sendResourceRequest({
      method: 'DELETE',
      resourceName,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier,
      failureErrorCode,
    });
  }

  async sendResourceRequest({
    method,
    resourceName,
    apiBaseUrl,
    apiKey,
    shopDomain,
    resourceIdentifier,
    resource,
    failureErrorCode,
  }) {
    try {
      const response = await this.fetchImplementation(
        this.buildResourceUrl({
          resourceName,
          apiBaseUrl,
          resourceIdentifier,
        }),
        this.buildFetchOptions({
          method,
          apiKey,
          shopDomain,
          resource,
        }),
      );
      return await this.buildResponseResult({ response, failureErrorCode });
    } catch (error) {
      return this.buildTransportFailureResult({ error, failureErrorCode });
    }
  }

  buildResourceUrl({ resourceName, apiBaseUrl, resourceIdentifier }) {
    return new URL(
      this.buildResourcePath({ resourceName, resourceIdentifier }),
      this.buildNormalizedBaseUrl(apiBaseUrl),
    ).toString();
  }

  buildResourcePath({ resourceName, resourceIdentifier }) {
    if (resourceIdentifier === undefined) {
      return this.crudResourceDefinitionCollection.buildCollectionPath(resourceName);
    }

    return this.crudResourceDefinitionCollection.buildItemPath({
      resourceName,
      resourceIdentifier,
    });
  }

  buildNormalizedBaseUrl(apiBaseUrl) {
    return apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  }

  buildFetchOptions({ method, apiKey, shopDomain, resource }) {
    const options = {
      method,
      headers: this.buildRequestHeaders({
        apiKey,
        shopDomain,
        resource,
      }),
    };
    if (resource !== undefined) {
      options.body = JSON.stringify(resource);
    }

    return options;
  }

  buildRequestHeaders({ apiKey, shopDomain, resource }) {
    const requestHeaders = {
      'x-apiease-api-key': apiKey,
      'x-shop-myshopify-domain': shopDomain,
    };
    if (resource !== undefined) {
      requestHeaders['content-type'] = JSON_CONTENT_TYPE;
    }

    return requestHeaders;
  }

  async buildResponseResult({ response, failureErrorCode }) {
    const responseContentType = this.readResponseContentType(response);
    if (responseContentType && !this.isJsonContentType(responseContentType)) {
      return await this.buildNonJsonFailureResult({
        response,
        responseContentType,
        failureErrorCode,
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

  async buildNonJsonFailureResult({ response, responseContentType, failureErrorCode }) {
    return {
      status: response?.status || DEFAULT_FAILURE_STATUS,
      ok: false,
      errorCode: failureErrorCode,
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

  buildTransportFailureResult({ error, failureErrorCode }) {
    return {
      status: DEFAULT_FAILURE_STATUS,
      ok: false,
      errorCode: failureErrorCode,
      message: error.message,
      fieldErrors: [],
    };
  }
}

export { ApiEaseCrudResourceClient };
