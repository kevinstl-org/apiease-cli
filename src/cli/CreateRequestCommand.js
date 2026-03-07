import { ApiEaseCreateRequestClient } from '../client/ApiEaseCreateRequestClient.js';
import { RequestDefinitionFileLoader } from './RequestDefinitionFileLoader.js';

const JSON_FLAG = '--json';
const REQUIRED_OPTION_NAMES = ['--file', '--base-url', '--shop-domain', '--api-key'];
const USAGE_TEXT = [
  'Usage: apiease-cli create --file <path> --base-url <url> --shop-domain <shop-domain> --api-key <api-key> [--json]',
  '',
  'Options:',
  '  --file <path>                Path to the request definition JSON file.',
  '  --base-url <url>            APIEase base URL.',
  '  --shop-domain <shop-domain> Shopify shop domain.',
  '  --api-key <api-key>         APIEase API key.',
  '  --json                      Emit raw JSON output.',
].join('\n');

class CreateRequestCommand {
  constructor({
    requestDefinitionFileLoader = new RequestDefinitionFileLoader(),
    apiEaseCreateRequestClient = new ApiEaseCreateRequestClient(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.requestDefinitionFileLoader = requestDefinitionFileLoader;
    this.apiEaseCreateRequestClient = apiEaseCreateRequestClient;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(commandArguments = []) {
    const parseResult = this.parseCommandArguments(commandArguments);
    if (!parseResult.ok) {
      this.writeUsageFailure(parseResult.message);
      return 1;
    }

    const requestDefinitionResult = await this.requestDefinitionFileLoader.loadRequestDefinition(parseResult.filePath);
    if (!requestDefinitionResult.ok) {
      this.writeResult(requestDefinitionResult, parseResult.json);
      return 1;
    }

    const result = await this.apiEaseCreateRequestClient.createRequest({
      apiBaseUrl: parseResult.apiBaseUrl,
      apiKey: parseResult.apiKey,
      shopDomain: parseResult.shopDomain,
      request: requestDefinitionResult.requestDefinition,
    });
    this.writeResult(result, parseResult.json);
    return result.ok ? 0 : 1;
  }

  parseCommandArguments(commandArguments) {
    const optionMap = this.buildOptionMap(commandArguments);
    if (commandArguments[0] !== 'create') {
      return this.buildParseFailure('Unsupported command. Only "create" is supported.');
    }

    const missingRequiredOptionNames = this.buildMissingRequiredOptionNames(optionMap);
    if (missingRequiredOptionNames.length > 0) {
      return this.buildParseFailure(`Missing required arguments: ${missingRequiredOptionNames.join(', ')}`);
    }

    return {
      ok: true,
      filePath: optionMap['--file'],
      apiBaseUrl: optionMap['--base-url'],
      shopDomain: optionMap['--shop-domain'],
      apiKey: optionMap['--api-key'],
      json: optionMap[JSON_FLAG] === true,
    };
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
    const outputLines = ['Request created successfully.'];

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
      'Request creation failed.',
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

export { CreateRequestCommand };
