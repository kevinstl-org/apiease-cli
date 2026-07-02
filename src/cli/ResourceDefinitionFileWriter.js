import fs from 'node:fs/promises';

class ResourceDefinitionFileWriter {
  constructor({ fileSystem = fs } = {}) {
    this.fileSystem = fileSystem;
  }

  async writeResourceDefinition({ filePath, resourceDefinition }) {
    try {
      await this.fileSystem.writeFile(
        filePath,
        `${JSON.stringify(resourceDefinition, null, 2)}\n`,
        'utf8',
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        errorCode: 'RESOURCE_DEFINITION_FILE_WRITE_FAILED',
        message: `Resource definition file could not be written: ${filePath}`,
        fieldErrors: [],
      };
    }
  }
}

export { ResourceDefinitionFileWriter };
