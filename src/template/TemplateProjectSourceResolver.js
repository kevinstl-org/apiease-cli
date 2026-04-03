import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_TEMPLATE_REPOSITORY_URL = 'https://github.com/kevinstl-org/apiease-template';
const LOCAL_TEMPLATE_DISPLAY_SOURCE = '../apiease-template';
const PUBLIC_TEMPLATE_REPOSITORY_NAME = 'apiease-template';
const PUBLIC_TEMPLATE_REPOSITORY_OWNER = 'kevinstl-org';
const PUBLIC_TEMPLATE_REPOSITORY_REF = 'main';

class TemplateProjectSourceResolver {
  constructor({
    currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url)),
    pathExists = fs.existsSync,
  } = {}) {
    this.currentDirectoryPath = currentDirectoryPath;
    this.pathExists = pathExists;
  }

  resolveTemplateSource() {
    const localTemplateDirectoryPath = this.buildLocalTemplateDirectoryPath();
    if (this.pathExists(localTemplateDirectoryPath)) {
      return {
        sourceType: 'localDevelopment',
        displayTemplateSource: LOCAL_TEMPLATE_DISPLAY_SOURCE,
        templateDirectoryPath: localTemplateDirectoryPath,
        publicRepositoryUrl: PUBLIC_TEMPLATE_REPOSITORY_URL,
      };
    }

    return {
      sourceType: 'publicRepository',
      displayTemplateSource: PUBLIC_TEMPLATE_REPOSITORY_URL,
      publicRepositoryUrl: PUBLIC_TEMPLATE_REPOSITORY_URL,
      repositoryOwner: PUBLIC_TEMPLATE_REPOSITORY_OWNER,
      repositoryName: PUBLIC_TEMPLATE_REPOSITORY_NAME,
      repositoryRef: PUBLIC_TEMPLATE_REPOSITORY_REF,
    };
  }

  buildLocalTemplateDirectoryPath() {
    return path.resolve(this.currentDirectoryPath, '..', '..', '..', 'apiease-template');
  }
}

export { TemplateProjectSourceResolver };
