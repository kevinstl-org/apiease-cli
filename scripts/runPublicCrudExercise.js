#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiEasePublicCrudExercise } from '../src/integration/ApiEasePublicCrudExercise.js';

async function runPublicCrudExercise({
  environmentVariables = process.env,
  stdout = process.stdout,
  stderr = process.stderr,
  apiEasePublicCrudExerciseClass = ApiEasePublicCrudExercise,
} = {}) {
  const missingEnvironmentVariables = resolveMissingEnvironmentVariables(environmentVariables);
  if (missingEnvironmentVariables.length > 0) {
    stderr.write(
      `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}\n`,
    );
    return 1;
  }

  const apiEasePublicCrudExercise = new apiEasePublicCrudExerciseClass({
    apiBaseUrl: environmentVariables.APIEASE_API_BASE_URL,
    apiKey: environmentVariables.APIEASE_API_KEY,
    shopDomain: environmentVariables.APIEASE_SHOP_DOMAIN,
    stepReporter: (message) => {
      stdout.write(`${message}\n`);
    },
  });

  try {
    const result = await apiEasePublicCrudExercise.run();
    stdout.write(`Public CRUD exercise completed successfully for ${result.exerciseId}\n`);
    return 0;
  } catch (error) {
    stderr.write(`Public CRUD exercise failed: ${error.message}\n`);
    writeCleanupResults(stderr, error.cleanupResults);
    return 1;
  }
}

function resolveMissingEnvironmentVariables(environmentVariables) {
  const requiredEnvironmentVariableNames = [
    'APIEASE_API_BASE_URL',
    'APIEASE_API_KEY',
    'APIEASE_SHOP_DOMAIN',
  ];

  return requiredEnvironmentVariableNames.filter((environmentVariableName) => {
    const environmentVariableValue = environmentVariables[environmentVariableName];
    return typeof environmentVariableValue !== 'string' || environmentVariableValue.length === 0;
  });
}

function writeCleanupResults(stderr, cleanupResults = []) {
  if (!Array.isArray(cleanupResults) || cleanupResults.length === 0) {
    return;
  }

  stderr.write('Cleanup results:\n');
  for (const cleanupResult of cleanupResults) {
    const cleanupStatus = cleanupResult.isSuccess ? 'ok' : 'failed';
    stderr.write(`- ${cleanupResult.resourceType}: ${cleanupStatus}\n`);
  }
}

function shouldRunDirectly() {
  if (!process.argv[1]) {
    return false;
  }

  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (shouldRunDirectly()) {
  process.exitCode = await runPublicCrudExercise();
}

export { runPublicCrudExercise };
