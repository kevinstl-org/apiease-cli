#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiEaseHomeConfigurationResolver } from '../src/config/ApiEaseHomeConfigurationResolver.js';
import { ApiEasePublicCrudExercise } from '../src/integration/ApiEasePublicCrudExercise.js';

async function runPublicCrudExercise({
  environmentVariables = process.env,
  stdout = process.stdout,
  stderr = process.stderr,
  apiEasePublicCrudExerciseClass = ApiEasePublicCrudExercise,
  apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver(),
} = {}) {
  const resolvedExecutionConfiguration = await resolveExecutionConfiguration({
    environmentVariables,
    apiEaseHomeConfigurationResolver,
  });
  if (!resolvedExecutionConfiguration.ok) {
    stderr.write(`${resolvedExecutionConfiguration.message}\n`);
    return 1;
  }

  const missingEnvironmentVariables = resolveMissingEnvironmentVariables(
    resolvedExecutionConfiguration.environmentVariables,
  );
  if (missingEnvironmentVariables.length > 0) {
    stderr.write(
      `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}\n`,
    );
    return 1;
  }

  const apiEasePublicCrudExercise = new apiEasePublicCrudExerciseClass({
    apiBaseUrl: resolvedExecutionConfiguration.environmentVariables.APIEASE_BASE_URL,
    apiKey: resolvedExecutionConfiguration.environmentVariables.APIEASE_API_KEY,
    shopDomain: resolvedExecutionConfiguration.environmentVariables.APIEASE_SHOP_DOMAIN,
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

async function resolveExecutionConfiguration({
  environmentVariables,
  apiEaseHomeConfigurationResolver,
}) {
  const providedEnvironmentVariables = pickDefinedEnvironmentVariables(environmentVariables);
  if (resolveMissingEnvironmentVariables(providedEnvironmentVariables).length === 0) {
    return {
      ok: true,
      environmentVariables: providedEnvironmentVariables,
    };
  }

  const homeConfigurationResult = await apiEaseHomeConfigurationResolver.resolveEnvironmentVariables();
  if (!homeConfigurationResult.ok) {
    return {
      ok: true,
      environmentVariables: providedEnvironmentVariables,
    };
  }

  return {
    ok: true,
    environmentVariables: {
      ...pickDefinedEnvironmentVariables(homeConfigurationResult.environmentVariables),
      ...providedEnvironmentVariables,
    },
  };
}

function resolveMissingEnvironmentVariables(environmentVariables) {
  const requiredEnvironmentVariableNames = [
    'APIEASE_BASE_URL',
    'APIEASE_API_KEY',
    'APIEASE_SHOP_DOMAIN',
  ];

  return requiredEnvironmentVariableNames.filter((environmentVariableName) => {
    const environmentVariableValue = environmentVariables[environmentVariableName];
    return typeof environmentVariableValue !== 'string' || environmentVariableValue.length === 0;
  });
}

function pickDefinedEnvironmentVariables(environmentVariables = {}) {
  return Object.entries(environmentVariables).reduce((resolvedEnvironmentVariables, [name, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      resolvedEnvironmentVariables[name] = value;
    }
    return resolvedEnvironmentVariables;
  }, {});
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
