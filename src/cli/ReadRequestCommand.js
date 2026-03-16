import { ApiEaseReadRequestClient } from '../client/ApiEaseReadRequestClient.js';
import { ApiEaseHomeConfigurationResolver } from '../config/ApiEaseHomeConfigurationResolver.js';

const JSON_FLAG = '--json';
const REQUIRED_OPTION_NAMES = ['--request-id', '--base-url', '--shop-domain'];
const USAGE_TEXT = [
  'Usage: apiease-cli read --request-id <id> --base-url <url> --shop-domain <shop-domain> [--api-key <api-key>] [--json]',
  '',
  'Options:',
  '  --request-id <id>           APIEase request identifier.',
  '  --base-url <url>            APIEase base URL.',
  '  --shop-domain <shop-domain> Shopify shop domain.',
  '  --api-key <api-key>         APIEase API key. Defaults to ~/.apiease home configuration.',
  '  --json                      Emit raw JSON output.',
].join('\n');

class ReadRequestCommand {
  constructor({
    apiEaseReadRequestClient = new ApiEaseReadRequestClient(),
    apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.apiEaseReadRequestClient = apiEaseReadRequestClient;
    this.apiEaseHomeConfigurationResolver = apiEaseHomeConfigurationResolver;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(commandArguments = []) {
    const parseResult = this.parseCommandArguments(commandArguments);
    if (!parseResult.ok) {
      this.writeUsageFailure(parseResult.message);
      return 1;
    }

    const apiKeyResult = await this.resolveApiKey(parseResult.apiKey);
    if (!apiKeyResult.ok) {
      this.writeResult(apiKeyResult, parseResult.json);
      return 1;
    }

    const result = await this.apiEaseReadRequestClient.readRequest({
      apiBaseUrl: parseResult.apiBaseUrl,
      apiKey: apiKeyResult.apiKey,
      shopDomain: parseResult.shopDomain,
      requestId: parseResult.requestId,
    });
    this.writeResult(result, parseResult.json);
    return result.ok ? 0 : 1;
  }

  parseCommandArguments(commandArguments) {
    const optionMap = this.buildOptionMap(commandArguments);
    if (commandArguments[0] !== 'read') {
      return this.buildParseFailure('Unsupported command. Only "read" is supported.');
    }

    const missingRequiredOptionNames = this.buildMissingRequiredOptionNames(optionMap);
    if (missingRequiredOptionNames.length > 0) {
      return this.buildParseFailure(`Missing required arguments: ${missingRequiredOptionNames.join(', ')}`);
    }

    return {
      ok: true,
      requestId: optionMap['--request-id'],
      apiBaseUrl: optionMap['--base-url'],
      shopDomain: optionMap['--shop-domain'],
      apiKey: optionMap['--api-key'],
      json: optionMap[JSON_FLAG] === true,
    };
  }

  async resolveApiKey(explicitApiKey) {
    if (explicitApiKey) {
      return {
        ok: true,
        apiKey: explicitApiKey,
      };
    }

    return await this.apiEaseHomeConfigurationResolver.resolveConfiguration();
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

  buildMissingRequiredOptionNames(optionMap) {
    return REQUIRED_OPTION_NAMES.filter((requiredOptionName) => !optionMap[requiredOptionName]);
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
    const outputLines = ['Request read successfully.'];

    if (result.request?.id) {
      outputLines.push(`Request ID: ${result.request.id}`);
    }

    if (result.request?.name) {
      outputLines.push(`Name: ${result.request.name}`);
    }

    if (result.request?.type) {
      outputLines.push(`Type: ${result.request.type}`);
    }

    if (result.request?.method) {
      outputLines.push(`Method: ${result.request.method}`);
    }

    if (result.request?.address) {
      outputLines.push(`Address: ${result.request.address}`);
    }

    if (result.shopDomain) {
      outputLines.push(`Shop Domain: ${result.shopDomain}`);
    }

    return `${outputLines.join('\n')}\n`;
  }

  buildHumanReadableFailureOutput(result) {
    const outputLines = [
      'Request read failed.',
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

export { ReadRequestCommand };
