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
    it('should resolve the local development template directory and public repository metadata', async () => {
      // Arrange
      const { TemplateProjectSourceResolver } = await import(templateProjectSourceResolverModuleUrl);
      const templateProjectSourceResolver = new TemplateProjectSourceResolver();

      // Act
      const templateSource = templateProjectSourceResolver.resolveTemplateSource();

      // Assert
      assert.deepEqual(templateSource, {
        sourceType: 'localDevelopment',
        displayTemplateSource: '../apiease-template',
        templateDirectoryPath: path.resolve(projectDirectoryPath, '..', 'apiease-template'),
        publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
      });
    });
  });
});
