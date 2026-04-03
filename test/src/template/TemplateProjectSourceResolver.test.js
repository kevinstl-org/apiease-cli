import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const templateProjectSourceResolverModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'template', 'TemplateProjectSourceResolver.js'),
).href;

describe('TemplateProjectSourceResolver', () => {
  describe('resolveTemplateSource', () => {
    it('should resolve the local development template directory and public repository metadata when the sibling template exists', async () => {
      // Arrange
      const { TemplateProjectSourceResolver } = await import(templateProjectSourceResolverModuleUrl);
      const templateProjectSourceResolver = new TemplateProjectSourceResolver({
        currentDirectoryPath: '/tmp/apiease-cli/src/template',
        pathExists(targetPath) {
          return targetPath === '/tmp/apiease-template';
        },
      });

      // Act
      const templateSource = templateProjectSourceResolver.resolveTemplateSource();

      // Assert
      assert.deepEqual(templateSource, {
        sourceType: 'localDevelopment',
        displayTemplateSource: '../apiease-template',
        templateDirectoryPath: '/tmp/apiease-template',
        publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
      });
    });

    it('should fall back to the public GitHub template repository when the sibling template does not exist', async () => {
      // Arrange
      const { TemplateProjectSourceResolver } = await import(templateProjectSourceResolverModuleUrl);
      const templateProjectSourceResolver = new TemplateProjectSourceResolver({
        currentDirectoryPath: '/tmp/apiease-cli/src/template',
        pathExists() {
          return false;
        },
      });

      // Act
      const templateSource = templateProjectSourceResolver.resolveTemplateSource();

      // Assert
      assert.deepEqual(templateSource, {
        sourceType: 'publicRepository',
        displayTemplateSource: 'https://github.com/kevinstl-org/apiease-template',
        repositoryOwner: 'kevinstl-org',
        repositoryName: 'apiease-template',
        repositoryRef: 'main',
        publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
      });
    });
  });
});
