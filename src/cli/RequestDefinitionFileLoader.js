import fs from 'node:fs/promises';

class RequestDefinitionFileLoader {
  constructor({ fileSystem = fs } = {}) {
    this.fileSystem = fileSystem;
  }

  async loadRequestDefinition(filePath) {
    const fileContentResult = await this.readFileContent(filePath);
    if (!fileContentResult.ok) {
      return fileContentResult;
    }

    const jsonParseResult = this.parseJsonContent(fileContentResult.fileContent, filePath);
    if (!jsonParseResult.ok) {
      return jsonParseResult;
    }

    if (!this.isPlainObject(jsonParseResult.requestDefinition)) {
      return this.buildFailureResult(
        'REQUEST_DEFINITION_FILE_INVALID_ROOT',
        `Request definition file must contain a JSON object: ${filePath}`,
      );
    }

    return {
      ok: true,
      requestDefinition: jsonParseResult.requestDefinition,
    };
  }

  async readFileContent(filePath) {
    try {
      const fileContent = await this.fileSystem.readFile(filePath, 'utf8');
      return {
        ok: true,
        fileContent,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.buildFailureResult(
          'REQUEST_DEFINITION_FILE_NOT_FOUND',
          `Request definition file was not found: ${filePath}`,
        );
      }

      return this.buildFailureResult(
        'REQUEST_DEFINITION_FILE_READ_FAILED',
        `Request definition file could not be read: ${filePath}`,
      );
    }
  }

  parseJsonContent(fileContent, filePath) {
    try {
      return {
        ok: true,
        requestDefinition: JSON.parse(fileContent),
      };
    } catch (error) {
      return this.buildFailureResult(
        'REQUEST_DEFINITION_FILE_INVALID_JSON',
        `Request definition file contains invalid JSON: ${filePath}`,
      );
    }
  }

  buildFailureResult(errorCode, message) {
    return {
      ok: false,
      errorCode,
      message,
      fieldErrors: [],
    };
  }

  isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

export { RequestDefinitionFileLoader };
