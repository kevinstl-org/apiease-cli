import { ApiEaseCrudResourceClient } from './ApiEaseCrudResourceClient.js';

const REQUEST_RESOURCE_NAME = 'request';
const REQUEST_DELETE_FAILED = 'REQUEST_DELETE_FAILED';

class ApiEaseDeleteRequestClient {
  constructor({
    fetchImplementation = globalThis.fetch,
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient({ fetchImplementation }),
  } = {}) {
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
  }

  async deleteRequest({ apiBaseUrl, apiKey, shopDomain, requestId } = {}) {
    return await this.apiEaseCrudResourceClient.deleteResource({
      resourceName: REQUEST_RESOURCE_NAME,
      apiBaseUrl,
      apiKey,
      shopDomain,
      resourceIdentifier: requestId,
      failureErrorCode: REQUEST_DELETE_FAILED,
    });
  }
}

export { ApiEaseDeleteRequestClient };
