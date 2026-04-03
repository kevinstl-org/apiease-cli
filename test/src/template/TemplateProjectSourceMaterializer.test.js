import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const templateProjectSourceMaterializerModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'template', 'TemplateProjectSourceMaterializer.js'),
).href;

describe('TemplateProjectSourceMaterializer', () => {
  describe('materializeTemplateSource', () => {
    it('should reuse the existing local development template directory without fetching GitHub', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const fetchCalls = [];
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        fetch(...arguments_) {
          fetchCalls.push(arguments_);
          throw new Error('fetch should not be called');
        },
      });
      const templateSource = {
        sourceType: 'localDevelopment',
        displayTemplateSource: '../apiease-template',
        templateDirectoryPath: '/tmp/apiease-template',
      };

      // Act
      const materializedTemplate = await templateProjectSourceMaterializer.materializeTemplateSource(templateSource);

      // Assert
      assert.deepEqual(materializedTemplate.templateVersion, null);
      assert.equal(materializedTemplate.templateDirectoryPath, '/tmp/apiease-template');
      assert.equal(fetchCalls.length, 0);
      await materializedTemplate.cleanup();
    });

    it('should download the public repository template into a temporary directory and return the current commit version', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const temporaryDirectoryParentPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-template-materializer-'));
      const commitHash = '0123456789abcdef0123456789abcdef01234567';
      const fetchResponses = new Map([
        [
          'https://api.github.com/repos/kevinstl-org/apiease-template/branches/main',
          createJsonResponse({
            commit: {
              sha: commitHash,
              commit: {
                tree: {
                  sha: 'tree-sha-1',
                },
              },
            },
          }),
        ],
        [
          'https://api.github.com/repos/kevinstl-org/apiease-template/git/trees/tree-sha-1?recursive=1',
          createJsonResponse({
            tree: [
              {
                path: 'README.md',
                sha: 'blob-sha-readme',
                type: 'blob',
              },
              {
                path: 'docs/examples/example.json',
                sha: 'blob-sha-example',
                type: 'blob',
              },
            ],
          }),
        ],
        [
          'https://api.github.com/repos/kevinstl-org/apiease-template/git/blobs/blob-sha-readme',
          createJsonResponse({
            content: Buffer.from('template readme\n').toString('base64'),
            encoding: 'base64',
          }),
        ],
        [
          'https://api.github.com/repos/kevinstl-org/apiease-template/git/blobs/blob-sha-example',
          createJsonResponse({
            content: Buffer.from('{"ok":true}\n').toString('base64'),
            encoding: 'base64',
          }),
        ],
      ]);
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        temporaryDirectoryParentPath,
        async fetch(url) {
          const response = fetchResponses.get(url);
          if (!response) {
            throw new Error(`Unexpected fetch URL: ${url}`);
          }

          return response;
        },
      });
      const templateSource = {
        sourceType: 'publicRepository',
        repositoryOwner: 'kevinstl-org',
        repositoryName: 'apiease-template',
        repositoryRef: 'main',
      };

      // Act
      const materializedTemplate = await templateProjectSourceMaterializer.materializeTemplateSource(templateSource);

      // Assert
      assert.deepEqual(materializedTemplate.templateVersion, {
        type: 'gitCommit',
        value: commitHash,
      });
      assert.equal(
        await fs.readFile(path.join(materializedTemplate.templateDirectoryPath, 'README.md'), 'utf8'),
        'template readme\n',
      );
      assert.equal(
        await fs.readFile(path.join(materializedTemplate.templateDirectoryPath, 'docs', 'examples', 'example.json'), 'utf8'),
        '{"ok":true}\n',
      );

      await materializedTemplate.cleanup();
      await assert.rejects(fs.access(materializedTemplate.templateDirectoryPath));
    });

    it('should throw a descriptive error when the GitHub branch metadata request fails', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        async fetch() {
          return createJsonResponse({ message: 'rate limit' }, { ok: false, status: 403 });
        },
      });
      const templateSource = {
        sourceType: 'publicRepository',
        repositoryOwner: 'kevinstl-org',
        repositoryName: 'apiease-template',
        repositoryRef: 'main',
      };

      // Act / Assert
      await assert.rejects(
        () => templateProjectSourceMaterializer.materializeTemplateSource(templateSource),
        /GitHub template request failed with status 403/,
      );
    });
  });
});

function createJsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}
