import { ApiEaseCreateRequestClient } from '../client/ApiEaseCreateRequestClient.js';
import { ApiEaseCrudResourceClient } from '../client/ApiEaseCrudResourceClient.js';
import { ApiEaseRequestSourceIdentifierMigrationService } from '../client/ApiEaseRequestSourceIdentifierMigrationService.js';
import { ApiEaseHomeConfigurationResolver } from '../config/ApiEaseHomeConfigurationResolver.js';
import { CrudResourceDefinitionCollection } from '../crud/CrudResourceDefinitionCollection.js';
import { ApiEaseCommandConfigurationResolver } from './ApiEaseCommandConfigurationResolver.js';
import { RequestDefinitionFileLoader } from './RequestDefinitionFileLoader.js';

const JSON_FLAG = '--json';
const AUTO_UPDATE_SOURCE_IDENTIFIER_FLAG = '--auto-update-source-identifier';
const COMMAND_REQUIRED_OPTION_NAMES = ['--file'];
const CONFIGURATION_OPTION_NAMES = ['--base-url', '--shop-domain'];

class CreateRequestCommand {
  constructor({
    requestDefinitionFileLoader = new RequestDefinitionFileLoader(),
    apiEaseCreateRequestClient = new ApiEaseCreateRequestClient(),
    apiEaseCrudResourceClient = new ApiEaseCrudResourceClient(),
    apiEaseRequestSourceIdentifierMigrationService = new ApiEaseRequestSourceIdentifierMigrationService(),
    apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver(),
    crudResourceDefinitionCollection = new CrudResourceDefinitionCollection(),
    apiEaseCommandConfigurationResolver = new ApiEaseCommandConfigurationResolver({
      apiEaseHomeConfigurationResolver,
    }),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.requestDefinitionFileLoader = requestDefinitionFileLoader;
    this.apiEaseCreateRequestClient = apiEaseCreateRequestClient;
    this.apiEaseCrudResourceClient = apiEaseCrudResourceClient;
    this.apiEaseRequestSourceIdentifierMigrationService = apiEaseRequestSourceIdentifierMigrationService;
    this.crudResourceDefinitionCollection = crudResourceDefinitionCollection;
    this.apiEaseCommandConfigurationResolver = apiEaseCommandConfigurationResolver;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(commandArguments = []) {
    const parseResult = this.parseCommandArguments(commandArguments);
    if (!parseResult.ok) {
      this.writeUsageFailure(parseResult);
      return 1;
    }

    const configurationResult = await this.resolveCommandConfiguration(parseResult);
    if (!configurationResult.ok) {
      this.writeConfigurationFailure(configurationResult, parseResult);
      return 1;
    }

    const requestDefinitionResult = await this.requestDefinitionFileLoader.loadRequestDefinition(parseResult.filePath);
    if (!requestDefinitionResult.ok) {
      this.writeResult(requestDefinitionResult, parseResult);
      return 1;
    }

    const result = await this.createResource({
      parseResult,
      configurationResult,
      resourceDefinition: requestDefinitionResult.requestDefinition,
    });
    this.writeResult(result, parseResult);
    return result.ok ? 0 : 1;
  }

  parseCommandArguments(commandArguments) {
    if (commandArguments[0] !== 'create') {
      return this.buildParseFailure('Unsupported command. Only "create" is supported.');
    }

    const resourceName = commandArguments[1];
    if (!resourceName || resourceName.startsWith('--')) {
      return this.buildParseFailure('Missing required resource argument.');
    }

    const crudResourceDefinition = this.crudResourceDefinitionCollection.findResourceDefinition(resourceName);
    if (!crudResourceDefinition) {
      return this.buildParseFailure(`Unsupported resource: ${resourceName}.`);
    }

    const optionMap = this.buildOptionMap(commandArguments, 2);
    const missingRequiredOptionNames = this.buildMissingRequiredOptionNames(optionMap, COMMAND_REQUIRED_OPTION_NAMES);
    if (missingRequiredOptionNames.length > 0) {
      return this.buildParseFailure(
        `Missing required arguments: ${missingRequiredOptionNames.join(', ')}`,
        crudResourceDefinition,
      );
    }

    return {
      ok: true,
      crudResourceDefinition,
      filePath: optionMap['--file'],
      apiBaseUrl: optionMap['--base-url'],
      shopDomain: optionMap['--shop-domain'],
      apiKey: optionMap['--api-key'],
      json: optionMap[JSON_FLAG] === true,
      autoUpdateSourceIdentifier: optionMap[AUTO_UPDATE_SOURCE_IDENTIFIER_FLAG] === true,
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
      return this.buildParseFailure(
        `Missing required arguments: ${missingRequiredOptionNames.join(', ')}`,
        parseResult.crudResourceDefinition,
      );
    }

    return configurationResult;
  }

  async createResource({ parseResult, configurationResult, resourceDefinition }) {
    if (parseResult.crudResourceDefinition.resourceName === 'request') {
      const requestSourceIdentifierResult = this.prepareRequestSourceIdentifier({
        parseResult,
        requestDefinition: resourceDefinition,
      });
      if (!requestSourceIdentifierResult.ok) {
        return requestSourceIdentifierResult;
      }

      return await this.apiEaseCreateRequestClient.createRequest({
        apiBaseUrl: configurationResult.apiBaseUrl,
        apiKey: configurationResult.apiKey,
        shopDomain: configurationResult.shopDomain,
        request: requestSourceIdentifierResult.requestDefinition,
      });
    }

    return await this.apiEaseCrudResourceClient.createResource({
      resourceName: parseResult.crudResourceDefinition.resourceName,
      apiBaseUrl: configurationResult.apiBaseUrl,
      apiKey: configurationResult.apiKey,
      shopDomain: configurationResult.shopDomain,
      resource: resourceDefinition,
      failureErrorCode: this.buildFailureErrorCode(parseResult.crudResourceDefinition, 'CREATE'),
    });
  }

  buildOptionMap(commandArguments, startIndex) {
    const optionMap = {};

    for (let index = startIndex; index < commandArguments.length; index += 1) {
      const commandArgument = commandArguments[index];
      if (commandArgument === JSON_FLAG) {
        optionMap[JSON_FLAG] = true;
        continue;
      }

      if (commandArgument === AUTO_UPDATE_SOURCE_IDENTIFIER_FLAG) {
        optionMap[AUTO_UPDATE_SOURCE_IDENTIFIER_FLAG] = true;
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

  prepareRequestSourceIdentifier({ parseResult, requestDefinition }) {
    if (parseResult.autoUpdateSourceIdentifier) {
      return this.apiEaseRequestSourceIdentifierMigrationService.migrateRequestSourceIdentifier(requestDefinition);
    }

    if (this.hasOwnProperty(requestDefinition, 'id')) {
      return this.buildSourceIdRejectedResult();
    }

    if (!this.hasOwnProperty(requestDefinition, 'handle')) {
      return this.buildMissingHandleResult();
    }

    const validationResult = this.apiEaseRequestSourceIdentifierMigrationService.validateRequestHandle(requestDefinition.handle);
    if (!validationResult.ok) {
      return validationResult;
    }

    return {
      ok: true,
      requestDefinition,
    };
  }

  buildSourceIdRejectedResult() {
    return {
      ok: false,
      errorCode: 'APIEASE_REQUEST_SOURCE_ID_REJECTED',
      message: 'Request ids are server-owned. Rerun with --auto-update-source-identifier to migrate source metadata.',
      fieldErrors: [
        {
          path: 'id',
          code: 'SERVER_OWNED',
          message: 'Remove id or rerun with --auto-update-source-identifier.',
        },
      ],
    };
  }

  buildMissingHandleResult() {
    return {
      ok: false,
      errorCode: 'APIEASE_REQUEST_HANDLE_REQUIRED',
      message: 'Request handle is required. Rerun with --auto-update-source-identifier to infer one from source metadata.',
      fieldErrors: [
        {
          path: 'handle',
          code: 'REQUIRED',
          message: 'Add handle or rerun with --auto-update-source-identifier.',
        },
      ],
    };
  }

  hasOwnProperty(objectValue, propertyName) {
    return Object.prototype.hasOwnProperty.call(objectValue, propertyName);
  }

  buildParseFailure(message, crudResourceDefinition = null) {
    return {
      ok: false,
      message,
      usageText: this.buildUsageText(crudResourceDefinition),
    };
  }

  buildUsageText(crudResourceDefinition) {
    const resourceToken = crudResourceDefinition?.resourceName || this.buildSupportedResourceToken();
    const fileDescription = crudResourceDefinition
      ? `Path to the ${crudResourceDefinition.resourceName} definition JSON file.`
      : 'Path to the resource definition JSON file.';
    const usageLines = [
      `Usage: apiease create ${resourceToken} --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--auto-update-source-identifier] [--json]`,
      '',
      'Options:',
    ];

    if (!crudResourceDefinition) {
      usageLines.push(`  ${this.buildSupportedResourceToken()}      Supported resource name.`);
    }

    usageLines.push(
      `  --file <path>                 ${fileDescription}`,
      '  --base-url <url>            APIEase base URL. Defaults to ~/.apiease/.env.<environment>.',
      '  --shop-domain <shop-domain> Shopify shop domain. Defaults to ~/.apiease/.env.<environment>.',
      '  --api-key <api-key>         APIEase API key. Defaults to ~/.apiease home configuration.',
      '  --auto-update-source-identifier  Infer request handle metadata before creating a request.',
      '  --json                      Emit raw JSON output.',
    );

    return usageLines.join('\n');
  }

  buildSupportedResourceToken() {
    return `<${this.crudResourceDefinitionCollection.listSupportedResourceNames().join('|')}>`;
  }

  buildFailureErrorCode(crudResourceDefinition, operationName) {
    return `${crudResourceDefinition.resourceName.toUpperCase()}_${operationName}_FAILED`;
  }

  writeUsageFailure(parseFailure) {
    this.stderr.write(`${parseFailure.message}\n${parseFailure.usageText}\n`);
  }

  writeConfigurationFailure(result, parseResult) {
    if (result.errorCode) {
      this.writeResult(result, parseResult);
      return;
    }

    this.writeUsageFailure(result);
  }

  writeResult(result, parseResult) {
    const json = parseResult?.json === true;
    const output = json ? this.buildJsonOutput(result) : this.buildHumanReadableOutput(result, parseResult);
    const stream = json || result.ok ? this.stdout : this.stderr;
    stream.write(output);
  }

  buildJsonOutput(result) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  buildHumanReadableOutput(result, parseResult) {
    return result.ok
      ? this.buildHumanReadableSuccessOutput(result, parseResult)
      : this.buildHumanReadableFailureOutput(result, parseResult);
  }

  buildHumanReadableSuccessOutput(result, parseResult) {
    const crudResourceDefinition = this.readResultResourceDefinition(result, parseResult);
    const outputLines = [`${crudResourceDefinition.humanReadableLabel} created successfully.`];
    const resourceIdentifier = result?.[crudResourceDefinition.responsePayloadKey]?.[crudResourceDefinition.identifierPropertyName];

    if (resourceIdentifier) {
      outputLines.push(
        `${crudResourceDefinition.humanReadableLabel} ${this.buildIdentifierLabel(crudResourceDefinition)}: ${resourceIdentifier}`,
      );
    }

    if (result.shopDomain) {
      outputLines.push(`Shop Domain: ${result.shopDomain}`);
    }

    return `${outputLines.join('\n')}\n`;
  }

  buildHumanReadableFailureOutput(result, parseResult) {
    const crudResourceDefinition = this.readResultResourceDefinition(result, parseResult);
    const outputLines = [
      `${crudResourceDefinition.humanReadableLabel} creation failed.`,
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

  readResultResourceDefinition(result, parseResult) {
    if (parseResult?.crudResourceDefinition) {
      return parseResult.crudResourceDefinition;
    }

    return this.crudResourceDefinitionCollection.listSupportedResourceNames()
      .map((resourceName) => this.crudResourceDefinitionCollection.readResourceDefinition(resourceName))
      .find((crudResourceDefinition) => result?.[crudResourceDefinition.responsePayloadKey]) || this.crudResourceDefinitionCollection.readResourceDefinition('request');
  }

  buildIdentifierLabel(crudResourceDefinition) {
    if (crudResourceDefinition.identifierValueName === 'id') {
      return 'ID';
    }

    return `${crudResourceDefinition.identifierValueName.charAt(0).toUpperCase()}${crudResourceDefinition.identifierValueName.slice(1)}`;
  }
}

export { CreateRequestCommand };
