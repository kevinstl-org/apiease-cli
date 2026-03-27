import { ApiEaseHomeConfigurationResolver } from '../config/ApiEaseHomeConfigurationResolver.js';

const APIEASE_API_KEY_NAME = 'APIEASE_API_KEY';
const APIEASE_BASE_URL_NAME = 'APIEASE_BASE_URL';
const APIEASE_SHOP_DOMAIN_NAME = 'APIEASE_SHOP_DOMAIN';

class ApiEaseCommandConfigurationResolver {
  constructor({
    apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver(),
  } = {}) {
    this.apiEaseHomeConfigurationResolver = apiEaseHomeConfigurationResolver;
  }

  async resolveConfiguration({
    explicitApiBaseUrl,
    explicitApiKey,
    explicitShopDomain,
  } = {}) {
    if (this.hasExplicitConfiguration({ explicitApiBaseUrl, explicitApiKey, explicitShopDomain })) {
      return this.buildSuccessResult({
        apiBaseUrl: explicitApiBaseUrl,
        apiKey: explicitApiKey,
        shopDomain: explicitShopDomain,
      });
    }

    const environmentVariablesResult = await this.apiEaseHomeConfigurationResolver.resolveEnvironmentVariables();
    if (!environmentVariablesResult.ok) {
      return environmentVariablesResult;
    }

    const apiKey = this.resolveApiKey({
      environmentVariables: environmentVariablesResult.environmentVariables,
      explicitApiKey,
    });
    if (!apiKey) {
      return this.apiEaseHomeConfigurationResolver.buildApiKeyMissingFailureResult(
        environmentVariablesResult.environmentVariablesFilePath,
      );
    }

    return this.buildSuccessResult({
      apiBaseUrl: explicitApiBaseUrl || environmentVariablesResult.environmentVariables[APIEASE_BASE_URL_NAME],
      apiKey,
      shopDomain: explicitShopDomain || environmentVariablesResult.environmentVariables[APIEASE_SHOP_DOMAIN_NAME],
    });
  }

  hasExplicitConfiguration({ explicitApiBaseUrl, explicitApiKey, explicitShopDomain }) {
    return Boolean(explicitApiBaseUrl && explicitApiKey && explicitShopDomain);
  }

  resolveApiKey({ environmentVariables, explicitApiKey }) {
    return explicitApiKey || environmentVariables[APIEASE_API_KEY_NAME];
  }

  buildSuccessResult({ apiBaseUrl, apiKey, shopDomain }) {
    return {
      ok: true,
      apiBaseUrl,
      apiKey,
      shopDomain,
    };
  }
}

export { ApiEaseCommandConfigurationResolver };
