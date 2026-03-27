import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';

const REQUEST_RESOURCE_NAME = 'request';
const REQUEST_READ_FAILED = 'REQUEST_READ_FAILED';

class ApiEaseReadRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({ fetchImplementation }),
  } = {}) {
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
  }

  async readRequest({ apiBaseUrl, apiKey, shopDomain, requestId } = {}) {
    return await this.apiEaseCrudResourceClient.readResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: requestId,
      failureErrorCode: REQUEST_READ_FAILED,
    });
  }
}

export { ApiEaseReadRequestClient };
