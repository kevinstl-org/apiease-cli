import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const apiEaseHomeConfigurationResolverModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'config', 'ApiEaseHomeConfigurationResolver.js'),
).href;

describe('ApiEaseHomeConfigurationResolver', () => {
  let temporaryDirectoryPath;

  before(async () => {
    temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-cli-home-config-'));
  });

  after(async () => {
    await fs.rm(temporaryDirectoryPath, { recursive: true, force: true });
  });

  describe('resolveConfiguration', () => {
    it('should resolve the active environment and API key from the matching home env file', async () => {
      // Arrange
      const { ApiEaseHomeConfigurationResolver } = await import(apiEaseHomeConfigurationResolverModuleUrl);
      const homeDirectoryPath = path.join(temporaryDirectoryPath, 'success-home');
      const apieaseDirectoryPath = path.join(homeDirectoryPath, '.apiease');
      const environmentDeclarationFilePath = path.join(apieaseDirectoryPath, 'environment');
      const environmentVariablesFilePath = path.join(apieaseDirectoryPath, '.env.staging');
      await fs.mkdir(apieaseDirectoryPath, { recursive: true });
      await fs.writeFile(environmentDeclarationFilePath, 'staging\n', 'utf8');
      await fs.writeFile(environmentVariablesFilePath, 'APIEASE_API_KEY=staging-api-key\n', 'utf8');
      const apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver({
        homeDirectoryPath,
      });

      // Act
      const result = await apiEaseHomeConfigurationResolver.resolveConfiguration();

      // Assert
      assert.deepEqual(result, {
        ok: true,
        environment: 'staging',
        apiKey: 'staging-api-key',
        environmentDeclarationFilePath,
        environmentVariablesFilePath,
      });
    });

    it('should return a structured error when the environment declaration file is missing', async () => {
      // Arrange
      const { ApiEaseHomeConfigurationResolver } = await import(apiEaseHomeConfigurationResolverModuleUrl);
      const homeDirectoryPath = path.join(temporaryDirectoryPath, 'missing-environment-home');
      const environmentDeclarationFilePath = path.join(homeDirectoryPath, '.apiease', 'environment');
      const apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver({
        homeDirectoryPath,
      });

      // Act
      const result = await apiEaseHomeConfigurationResolver.resolveConfiguration();

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_HOME_ENVIRONMENT_FILE_NOT_FOUND',
        message: `APIEASE home environment file was not found: ${environmentDeclarationFilePath}`,
        filePath: environmentDeclarationFilePath,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the environment declaration value is invalid', async () => {
      // Arrange
      const { ApiEaseHomeConfigurationResolver } = await import(apiEaseHomeConfigurationResolverModuleUrl);
      const homeDirectoryPath = path.join(temporaryDirectoryPath, 'invalid-environment-home');
      const apieaseDirectoryPath = path.join(homeDirectoryPath, '.apiease');
      const environmentDeclarationFilePath = path.join(apieaseDirectoryPath, 'environment');
      await fs.mkdir(apieaseDirectoryPath, { recursive: true });
      await fs.writeFile(environmentDeclarationFilePath, 'qa\n', 'utf8');
      const apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver({
        homeDirectoryPath,
      });

      // Act
      const result = await apiEaseHomeConfigurationResolver.resolveConfiguration();

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_HOME_ENVIRONMENT_INVALID',
        message: `APIEASE home environment must be one of local, staging, production: ${environmentDeclarationFilePath}`,
        filePath: environmentDeclarationFilePath,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the selected env file is missing', async () => {
      // Arrange
      const { ApiEaseHomeConfigurationResolver } = await import(apiEaseHomeConfigurationResolverModuleUrl);
      const homeDirectoryPath = path.join(temporaryDirectoryPath, 'missing-env-file-home');
      const apieaseDirectoryPath = path.join(homeDirectoryPath, '.apiease');
      const environmentDeclarationFilePath = path.join(apieaseDirectoryPath, 'environment');
      const environmentVariablesFilePath = path.join(apieaseDirectoryPath, '.env.production');
      await fs.mkdir(apieaseDirectoryPath, { recursive: true });
      await fs.writeFile(environmentDeclarationFilePath, 'production\n', 'utf8');
      const apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver({
        homeDirectoryPath,
      });

      // Act
      const result = await apiEaseHomeConfigurationResolver.resolveConfiguration();

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_HOME_ENV_FILE_NOT_FOUND',
        message: `APIEASE home environment file was not found: ${environmentVariablesFilePath}`,
        filePath: environmentVariablesFilePath,
        fieldErrors: [],
      });
    });

    it('should return a structured error when the selected env file does not define APIEASE_API_KEY', async () => {
      // Arrange
      const { ApiEaseHomeConfigurationResolver } = await import(apiEaseHomeConfigurationResolverModuleUrl);
      const homeDirectoryPath = path.join(temporaryDirectoryPath, 'missing-api-key-home');
      const apieaseDirectoryPath = path.join(homeDirectoryPath, '.apiease');
      const environmentDeclarationFilePath = path.join(apieaseDirectoryPath, 'environment');
      const environmentVariablesFilePath = path.join(apieaseDirectoryPath, '.env.local');
      await fs.mkdir(apieaseDirectoryPath, { recursive: true });
      await fs.writeFile(environmentDeclarationFilePath, 'local\n', 'utf8');
      await fs.writeFile(environmentVariablesFilePath, 'OTHER_KEY=value\n', 'utf8');
      const apiEaseHomeConfigurationResolver = new ApiEaseHomeConfigurationResolver({
        homeDirectoryPath,
      });

      // Act
      const result = await apiEaseHomeConfigurationResolver.resolveConfiguration();

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_HOME_API_KEY_MISSING',
        message: `APIEASE_API_KEY was not found in environment file: ${environmentVariablesFilePath}`,
        filePath: environmentVariablesFilePath,
        fieldErrors: [],
      });
    });
  });
});
