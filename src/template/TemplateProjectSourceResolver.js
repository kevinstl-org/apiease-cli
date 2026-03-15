import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_TEMPLATE_REPOSITORY_URL = 'https://github.com/kevinstl-org/apiease-template';
const LOCAL_TEMPLATE_DISPLAY_SOURCE = '../apiease-template';

class TemplateProjectSourceResolver {
  resolveTemplateSource() {
    return {
      sourceType: 'localDevelopment',
      displayTemplateSource: LOCAL_TEMPLATE_DISPLAY_SOURCE,
      templateDirectoryPath: this.buildLocalTemplateDirectoryPath(),
      publicRepositoryUrl: PUBLIC_TEMPLATE_REPOSITORY_URL,
    };
  }

  buildLocalTemplateDirectoryPath() {
    const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(currentDirectoryPath, '..', '..', '..', 'apiease-template');
  }
}

export { TemplateProjectSourceResolver };
