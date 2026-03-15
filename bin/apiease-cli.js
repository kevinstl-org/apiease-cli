#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreateRequestCommand } from '../src/cli/CreateRequestCommand.js';
import { InitProjectCommand } from '../src/cli/InitProjectCommand.js';
import { UpgradeProjectCommand } from '../src/cli/UpgradeProjectCommand.js';
import { RequestDefinitionFileLoader } from '../src/cli/RequestDefinitionFileLoader.js';
import { ApiEaseCreateRequestClient } from '../src/client/ApiEaseCreateRequestClient.js';
import { ApiEaseCreateRequestContractValidator } from '../src/client/ApiEaseCreateRequestContractValidator.js';

const JSON_FLAG = '--json';
const DEFAULT_FAILURE_STATUS = 500;
const UNEXPECTED_CLI_ERROR = 'UNEXPECTED_CLI_ERROR';
const INIT_COMMAND_NAME = 'init';
const UPGRADE_COMMAND_NAME = 'upgrade';
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

async function runCli({
  commandArguments = process.argv.slice(2),
  createRequestCommand = buildCreateRequestCommand(),
  initProjectCommand = buildInitProjectCommand(),
  upgradeProjectCommand = buildUpgradeProjectCommand(),
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const command = resolveCommand({
      commandArguments,
      createRequestCommand,
      initProjectCommand,
      upgradeProjectCommand,
    });
    return await command.run(commandArguments);
  } catch (error) {
    const failureResult = buildUnexpectedFailureResult(error);
    const output = buildFailureOutput({
      commandArguments,
      failureResult,
    });
    writeFailureOutput({ stdout, stderr, commandArguments, output });
    return 1;
  }
}

function resolveCommand({
  commandArguments,
  createRequestCommand,
  initProjectCommand,
  upgradeProjectCommand,
}) {
  if (commandArguments[0] === INIT_COMMAND_NAME) {
    return initProjectCommand;
  }

  if (commandArguments[0] === UPGRADE_COMMAND_NAME) {
    return upgradeProjectCommand;
  }

  return createRequestCommand;
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
    'Request creation failed.',
    `Error Code: ${failureResult.errorCode}`,
    `Message: ${failureResult.message}`,
    `Status: ${failureResult.status}`,
    '',
  ].join('\n');
}

function writeFailureOutput({ stdout, stderr, commandArguments, output }) {
  if (commandArguments.includes(JSON_FLAG)) {
    stderr.write(output);
    return;
  }

  stderr.write(output);
  stdout.write('');
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
