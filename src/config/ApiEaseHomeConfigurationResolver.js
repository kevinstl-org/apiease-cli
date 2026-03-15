import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const APIEASE_DIRECTORY_NAME = '.apiease';
const APIEASE_API_KEY_NAME = 'APIEASE_API_KEY';
const SUPPORTED_ENVIRONMENTS = ['local', 'staging', 'production'];

class ApiEaseHomeConfigurationResolver {
  constructor({
    fileSystem = fs,
    homeDirectoryPath = os.homedir(),
  } = {}) {
    this.fileSystem = fileSystem;
    this.homeDirectoryPath = homeDirectoryPath;
  }

  async resolveConfiguration() {
    const environmentDeclarationFilePath = this.buildEnvironmentDeclarationFilePath();
    const environmentResult = await this.readEnvironment(environmentDeclarationFilePath);
    if (!environmentResult.ok) {
      return environmentResult;
    }

    const environmentVariablesFilePath = this.buildEnvironmentVariablesFilePath(environmentResult.environment);
    const apiKeyResult = await this.readApiKey(environmentVariablesFilePath);
    if (!apiKeyResult.ok) {
      return apiKeyResult;
    }

    return {
      ok: true,
      environment: environmentResult.environment,
      apiKey: apiKeyResult.apiKey,
      environmentDeclarationFilePath,
      environmentVariablesFilePath,
    };
  }

  buildEnvironmentDeclarationFilePath() {
    return path.join(this.homeDirectoryPath, APIEASE_DIRECTORY_NAME, 'environment');
  }

  buildEnvironmentVariablesFilePath(environment) {
    return path.join(this.homeDirectoryPath, APIEASE_DIRECTORY_NAME, `.env.${environment}`);
  }

  async readEnvironment(environmentDeclarationFilePath) {
    const fileContentResult = await this.readFileContent({
      filePath: environmentDeclarationFilePath,
      notFoundErrorCode: 'APIEASE_HOME_ENVIRONMENT_FILE_NOT_FOUND',
      readFailedErrorCode: 'APIEASE_HOME_ENVIRONMENT_FILE_READ_FAILED',
      fileDescription: 'APIEASE home environment file',
    });
    if (!fileContentResult.ok) {
      return fileContentResult;
    }

    const environment = fileContentResult.fileContent.trim();
    if (!SUPPORTED_ENVIRONMENTS.includes(environment)) {
      return this.buildFailureResult(
        'APIEASE_HOME_ENVIRONMENT_INVALID',
        `APIEASE home environment must be one of ${SUPPORTED_ENVIRONMENTS.join(', ')}: ${environmentDeclarationFilePath}`,
        environmentDeclarationFilePath,
      );
    }

    return {
      ok: true,
      environment,
    };
  }

  async readApiKey(environmentVariablesFilePath) {
    const fileContentResult = await this.readFileContent({
      filePath: environmentVariablesFilePath,
      notFoundErrorCode: 'APIEASE_HOME_ENV_FILE_NOT_FOUND',
      readFailedErrorCode: 'APIEASE_HOME_ENV_FILE_READ_FAILED',
      fileDescription: 'APIEASE home environment file',
    });
    if (!fileContentResult.ok) {
      return fileContentResult;
    }

    const apiKey = this.parseEnvironmentVariables(fileContentResult.fileContent)[APIEASE_API_KEY_NAME];
    if (!apiKey) {
      return this.buildFailureResult(
        'APIEASE_HOME_API_KEY_MISSING',
        `APIEASE_API_KEY was not found in environment file: ${environmentVariablesFilePath}`,
        environmentVariablesFilePath,
      );
    }

    return {
      ok: true,
      apiKey,
    };
  }

  async readFileContent({ filePath, notFoundErrorCode, readFailedErrorCode, fileDescription }) {
    try {
      const fileContent = await this.fileSystem.readFile(filePath, 'utf8');
      return {
        ok: true,
        fileContent,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.buildFailureResult(
          notFoundErrorCode,
          `${fileDescription} was not found: ${filePath}`,
          filePath,
        );
      }

      return this.buildFailureResult(
        readFailedErrorCode,
        `${fileDescription} could not be read: ${filePath}`,
        filePath,
      );
    }
  }

  parseEnvironmentVariables(fileContent) {
    return fileContent.split(/\r?\n/u).reduce((environmentVariables, line) => {
      const environmentVariable = this.parseEnvironmentVariable(line);
      if (!environmentVariable) {
        return environmentVariables;
      }

      environmentVariables[environmentVariable.name] = environmentVariable.value;
      return environmentVariables;
    }, {});
  }

  parseEnvironmentVariable(line) {
    const normalizedLine = this.normalizeEnvironmentVariableLine(line);
    if (!normalizedLine) {
      return null;
    }

    const equalsSignIndex = normalizedLine.indexOf('=');
    if (equalsSignIndex < 1) {
      return null;
    }

    return {
      name: normalizedLine.slice(0, equalsSignIndex).trim(),
      value: this.stripWrappingQuotes(normalizedLine.slice(equalsSignIndex + 1).trim()),
    };
  }

  normalizeEnvironmentVariableLine(line) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return null;
    }

    return trimmedLine.startsWith('export ')
      ? trimmedLine.slice('export '.length).trim()
      : trimmedLine;
  }

  stripWrappingQuotes(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }

    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }

    return value;
  }

  buildFailureResult(errorCode, message, filePath) {
    return {
      ok: false,
      errorCode,
      message,
      filePath,
      fieldErrors: [],
    };
  }
}

export { ApiEaseHomeConfigurationResolver };
