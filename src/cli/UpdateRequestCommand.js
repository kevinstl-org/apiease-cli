import { ApiEaseUpdateRequestClient } from '../client/ApiEaseUpdateRequestClient.js';
import { ApiEaseHomeConfigurationResolver } from '../config/ApiEaseHomeConfigurationResolver.js';
import { ApiEaseCommandConfigurationResolver } from './ApiEaseCommandConfigurationResolver.js';
import { RequestDefinitionFileLoader } from './RequestDefinitionFileLoader.js';

const JSON_FLAG = '--json';
const COMMAND_REQUIRED_OPTION_NAMES = ['--request-id', '--file'];
const CONFIGURATION_OPTION_NAMES = ['--base-url', '--shop-domain'];
const USAGE_TEXT = [
  'Usage: apiease-cli update --request-id <id> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]',
  '',
  'Options:',
  '  --request-id <id>           APIEase request identifier.',
  '  --file <path>               Path to the request definition JSON file.',
  '  --base-url <url>            APIEase base URL. Defaults to ~/.apiease/.env.<environment>.',
  '  --shop-domain <shop-domain> Shopify shop domain. Defaults to ~/.apiease/.env.<environment>.',
  '  --api-key <api-key>         APIEase API key. Defaults to ~/.apiease home configuration.',
  '  --json                      Emit raw JSON output.',
].join('\n');

class UpdateRequestCommand {
  constructor({
    requestDefinitionFileLoader = new RequestDefinitionFileLoader(),
    apiEaseUpdateRequestClient = new ApiEaseUpdateRequestClient(),
    apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver(),
    apiEaseCommandConfigurationResolver = new ApiEaseCommandConfigurationResolver({
      apiEaseHomeConfigurationResolver,
    }),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.requestDefinitionFileLoader = requestDefinitionFileLoader;
    this.apiEaseUpdateRequestClient = apiEaseUpdateRequestClient;
    this.apiEaseCommandConfigurationResolver = apiEaseCommandConfigurationResolver;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(commandArguments = []) {
    const parseResult = this.parseCommandArguments(commandArguments);
    if (!parseResult.ok) {
      this.writeUsageFailure(parseResult.message);
      return 1;
    }

    const configurationResult = await this.resolveCommandConfiguration(parseResult);
    if (!configurationResult.ok) {
      this.writeConfigurationFailure(configurationResult, parseResult.json);
      return 1;
    }

    const requestDefinitionResult = await this.requestDefinitionFileLoader.loadRequestDefinition(parseResult.filePath);
    if (!requestDefinitionResult.ok) {
      this.writeResult(requestDefinitionResult, parseResult.json);
      return 1;
    }

    const result = await this.apiEaseUpdateRequestClient.updateRequest({
      apiBaseUrl: configurationResult.apiBaseUrl,
      apiKey: configurationResult.apiKey,
      shopDomain: configurationResult.shopDomain,
      requestId: parseResult.requestId,
      request: requestDefinitionResult.requestDefinition,
    });
    this.writeResult(result, parseResult.json);
    return result.ok ? 0 : 1;
  }

  parseCommandArguments(commandArguments) {
    const optionMap = this.buildOptionMap(commandArguments);
    if (commandArguments[0] !== 'update') {
      return this.buildParseFailure('Unsupported command. Only "update" is supported.');
    }

    const missingRequiredOptionNames = this.buildMissingRequiredOptionNames(optionMap, COMMAND_REQUIRED_OPTION_NAMES);
    if (missingRequiredOptionNames.length > 0) {
      return this.buildParseFailure(`Missing required arguments: ${missingRequiredOptionNames.join(', ')}`);
    }

    return {
      ok: true,
      requestId: optionMap['--request-id'],
      filePath: optionMap['--file'],
      apiBaseUrl: optionMap['--base-url'],
      shopDomain: optionMap['--shop-domain'],
      apiKey: optionMap['--api-key'],
      json: optionMap[JSON_FLAG] === true,
    };
  }

  async resolveCommandConfiguration(parseResult) {
    const configurationResult = await this.apiEaseCommandConfigurationResolver.resolveConfiguration({
      explicitApiBaseUrl: parseResult.apiBaseUrl,
      explicitApiKey: parseResult.apiKey,
      explicitShopDomain: parseResult.shopDomain,
    });
    if (!configurationResult.ok) {
      return configurationResult;
    }

    const missingRequiredOptionNames = this.buildMissingRequiredOptionNames({
      '--base-url': configurationResult.apiBaseUrl,
      '--shop-domain': configurationResult.shopDomain,
    }, CONFIGURATION_OPTION_NAMES);
    if (missingRequiredOptionNames.length > 0) {
      return this.buildParseFailure(`Missing required arguments: ${missingRequiredOptionNames.join(', ')}`);
    }

    return configurationResult;
  }

  buildOptionMap(commandArguments) {
    const optionMap = {};

    for (let index = 1; index < commandArguments.length; index += 1) {
      const commandArgument = commandArguments[index];
      if (commandArgument === JSON_FLAG) {
        optionMap[JSON_FLAG] = true;
        continue;
      }

      optionMap[commandArgument] = commandArguments[index + 1];
      index += 1;
    }

    return optionMap;
  }

  buildMissingRequiredOptionNames(optionMap, requiredOptionNames) {
    return requiredOptionNames.filter((requiredOptionName) => !optionMap[requiredOptionName]);
  }

  buildParseFailure(message) {
    return {
      ok: false,
      message,
    };
  }

  writeUsageFailure(message) {
    this.stderr.write(`${message}\n${USAGE_TEXT}\n`);
  }

  writeConfigurationFailure(result, json) {
    if (result.errorCode) {
      this.writeResult(result, json);
      return;
    }

    this.writeUsageFailure(result.message);
  }

  writeResult(result, json) {
    const output = json ? this.buildJsonOutput(result) : this.buildHumanReadableOutput(result);
    const stream = json || result.ok ? this.stdout : this.stderr;
    stream.write(output);
  }

  buildJsonOutput(result) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  buildHumanReadableOutput(result) {
    return result.ok ? this.buildHumanReadableSuccessOutput(result) : this.buildHumanReadableFailureOutput(result);
  }

  buildHumanReadableSuccessOutput(result) {
    const outputLines = ['Request updated successfully.'];

    if (result.request?.id) {
      outputLines.push(`Request ID: ${result.request.id}`);
    }

    if (result.shopDomain) {
      outputLines.push(`Shop Domain: ${result.shopDomain}`);
    }

    return `${outputLines.join('\n')}\n`;
  }

  buildHumanReadableFailureOutput(result) {
    const outputLines = [
      'Request update failed.',
      `Error Code: ${result.errorCode}`,
      `Message: ${result.message}`,
    ];

    if (result.status) {
      outputLines.push(`Status: ${result.status}`);
    }

    for (const fieldError of result.fieldErrors ?? []) {
      outputLines.push(`Field Error: ${fieldError.path} ${fieldError.code} ${fieldError.message}`);
    }

    return `${outputLines.join('\n')}\n`;
  }
}

export { UpdateRequestCommand };
