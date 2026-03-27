#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreateRequestCommand } from '../src/cli/CreateRequestCommand.js';
import { DeleteRequestCommand } from '../src/cli/DeleteRequestCommand.js';
import { InitProjectCommand } from '../src/cli/InitProjectCommand.js';
import { ReadRequestCommand } from '../src/cli/ReadRequestCommand.js';
import { UpgradeProjectCommand } from '../src/cli/UpgradeProjectCommand.js';
import { UpdateRequestCommand } from '../src/cli/UpdateRequestCommand.js';
import { RequestDefinitionFileLoader } from '../src/cli/RequestDefinitionFileLoader.js';
import { TopLevelCliCommandRouter } from '../src/cli/TopLevelCliCommandRouter.js';
import { ApiEaseCreateRequestClient } from '../src/client/ApiEaseCreateRequestClient.js';
import { ApiEaseCreateRequestContractValidator } from '../src/client/ApiEaseCreateRequestContractValidator.js';
import { ApiEaseDeleteRequestClient } from '../src/client/ApiEaseDeleteRequestClient.js';
import { ApiEaseReadRequestClient } from '../src/client/ApiEaseReadRequestClient.js';
import { ApiEaseUpdateRequestClient } from '../src/client/ApiEaseUpdateRequestClient.js';

const JSON_FLAG = '--json';
const DEFAULT_FAILURE_STATUS = 500;
const UNEXPECTED_CLI_ERROR = 'UNEXPECTED_CLI_ERROR';
const CLI_VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

function buildCreateRequestCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();
  const apiEaseCreateRequestClient = new ApiEaseCreateRequestClient({
    apiEaseCreateRequestContractValidator,
  });
  const requestDefinitionFileLoader = new RequestDefinitionFileLoader();

  return new CreateRequestCommand({
    requestDefinitionFileLoader,
    apiEaseCreateRequestClient,
    stdout,
    stderr,
  });
}

function buildReadRequestCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  const apiEaseReadRequestClient = new ApiEaseReadRequestClient();

  return new ReadRequestCommand({
    apiEaseReadRequestClient,
    stdout,
    stderr,
  });
}

function buildUpdateRequestCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  const apiEaseCreateRequestContractValidator = new ApiEaseCreateRequestContractValidator();
  const apiEaseUpdateRequestClient = new ApiEaseUpdateRequestClient({
    apiEaseCreateRequestContractValidator,
  });
  const requestDefinitionFileLoader = new RequestDefinitionFileLoader();

  return new UpdateRequestCommand({
    requestDefinitionFileLoader,
    apiEaseUpdateRequestClient,
    stdout,
    stderr,
  });
}

function buildDeleteRequestCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  const apiEaseDeleteRequestClient = new ApiEaseDeleteRequestClient();

  return new DeleteRequestCommand({
    apiEaseDeleteRequestClient,
    stdout,
    stderr,
  });
}

function buildInitProjectCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  return new InitProjectCommand({
    cliVersion: CLI_VERSION,
    stdout,
    stderr,
  });
}

function buildUpgradeProjectCommand({ stdout = process.stdout, stderr = process.stderr } = {}) {
  return new UpgradeProjectCommand({
    stdout,
    stderr,
  });
}

function buildTopLevelCliCommandRouter() {
  return new TopLevelCliCommandRouter();
}

async function runCli({
  commandArguments = process.argv.slice(2),
  createRequestCommand = buildCreateRequestCommand(),
  readRequestCommand = buildReadRequestCommand(),
  updateRequestCommand = buildUpdateRequestCommand(),
  deleteRequestCommand = buildDeleteRequestCommand(),
  initProjectCommand = buildInitProjectCommand(),
  upgradeProjectCommand = buildUpgradeProjectCommand(),
  topLevelCliCommandRouter = buildTopLevelCliCommandRouter(),
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  const commandResult = topLevelCliCommandRouter.resolveCommand({
    commandArguments,
    createRequestCommand,
    readRequestCommand,
    updateRequestCommand,
    deleteRequestCommand,
    initProjectCommand,
    upgradeProjectCommand,
  });
  if (!commandResult.ok) {
    stderr.write(`${commandResult.message}\n${topLevelCliCommandRouter.buildUsageText()}\n`);
    return 1;
  }

  try {
    return await commandResult.command.run(commandArguments);
  } catch (error) {
    const failureResult = buildUnexpectedFailureResult(error);
    const output = buildFailureOutput({
      commandArguments,
      failureResult,
    });
    writeFailureOutput({ stderr, output });
    return 1;
  }
}

function buildUnexpectedFailureResult(error) {
  return {
    status: DEFAULT_FAILURE_STATUS,
    ok: false,
    errorCode: UNEXPECTED_CLI_ERROR,
    message: buildFailureMessage(error),
    fieldErrors: [],
  };
}

function buildFailureMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function buildFailureOutput({ commandArguments, failureResult }) {
  if (commandArguments.includes(JSON_FLAG)) {
    return `${JSON.stringify(failureResult, null, 2)}\n`;
  }

  return [
    'Command failed.',
    `Error Code: ${failureResult.errorCode}`,
    `Message: ${failureResult.message}`,
    `Status: ${failureResult.status}`,
    '',
  ].join('\n');
}

function writeFailureOutput({ stderr, output }) {
  stderr.write(output);
}

async function runEntrypoint() {
  process.exitCode = await runCli();
}

if (isExecutedAsEntrypoint()) {
  await runEntrypoint();
}

function isExecutedAsEntrypoint() {
  if (!process.argv[1]) {
    return false;
  }

  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

export { buildCreateRequestCommand, runCli };
