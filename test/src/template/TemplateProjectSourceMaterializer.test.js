import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
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

    it('should download the public repository template from the public commit feed and tarball without GitHub api requests', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const temporaryDirectoryParentPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-template-materializer-'));
      const commitHash = '0123456789abcdef0123456789abcdef01234567';
      const fetchUrls = [];
      const tarballBuffer = createTarGzArchive(
        {
          'apiease-template-0123456/README.md': 'template readme\n',
          'apiease-template-0123456/docs/examples/example.json': '{"ok":true}\n',
        },
      );
      const fetchResponses = new Map([
        [
          'https://github.com/kevinstl-org/apiease-template/commits/main.atom',
          createTextResponse(buildCommitFeed(commitHash)),
        ],
        [
          `https://github.com/kevinstl-org/apiease-template/archive/${commitHash}.tar.gz`,
          createBinaryResponse(tarballBuffer),
        ],
        [
          'https://api.github.com/repos/kevinstl-org/apiease-template/branches/main',
          createUnexpectedApiResponse(),
        ],
      ]);
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        temporaryDirectoryParentPath,
        async fetch(url) {
          fetchUrls.push(url);
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
      assert.equal(fetchUrls.includes('https://api.github.com/repos/kevinstl-org/apiease-template/branches/main'), false);

      await materializedTemplate.cleanup();
      await assert.rejects(fs.access(materializedTemplate.templateDirectoryPath));
    });

    it('should throw a descriptive error when the public commit feed does not include a commit sha', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        async fetch(url) {
          if (url === 'https://github.com/kevinstl-org/apiease-template/commits/main.atom') {
            return createTextResponse(
              [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<feed xmlns="http://www.w3.org/2005/Atom">',
                '  <entry><id>tag:github.com,2008:Grit::Commit/not-a-commit</id></entry>',
                '</feed>',
              ].join('\n'),
            );
          }

          throw new Error(`Unexpected fetch URL: ${url}`);
        },
      });
      const templateSource = {
        sourceType: 'publicRepository',
        repositoryOwner: 'kevinstl-org',
        repositoryName: 'apiease-template',
        repositoryRef: 'main',
      };

      // Act
      await assert.rejects(
        () => templateProjectSourceMaterializer.materializeTemplateSource(templateSource),
        /GitHub public commit feed did not include a commit sha/,
      );
    });

    it('should throw a descriptive error when the public tarball request fails', async () => {
      // Arrange
      const { TemplateProjectSourceMaterializer } = await import(templateProjectSourceMaterializerModuleUrl);
      const templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer({
        async fetch(url) {
          if (url === 'https://github.com/kevinstl-org/apiease-template/commits/main.atom') {
            return createTextResponse(buildCommitFeed('0123456789abcdef0123456789abcdef01234567'));
          }

          if (url === 'https://github.com/kevinstl-org/apiease-template/archive/0123456789abcdef0123456789abcdef01234567.tar.gz') {
            return createBinaryResponse(Buffer.from('archive missing'), { ok: false, status: 404 });
          }

          throw new Error(`Unexpected fetch URL: ${url}`);
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
        /GitHub template request failed with status 404/,
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

function createUnexpectedApiResponse() {
  return {
    get ok() {
      throw new Error('GitHub api should not be called for public template materialization');
    },
  };
}

function createTextResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async text() {
      return body;
    },
  };
}

function createBinaryResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async arrayBuffer() {
      return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength);
    },
  };
}

function buildCommitFeed(commitHash) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <entry><id>tag:github.com,2008:Grit::Commit/${commitHash}</id></entry>`,
    '</feed>',
  ].join('\n');
}

function createTarGzArchive(fileContentsByPath) {
  const archiveEntries = Object.entries(fileContentsByPath)
    .map(([filePath, fileContent]) => createTarEntry(filePath, fileContent))
    .flat();

  return zlib.gzipSync(Buffer.concat([...archiveEntries, Buffer.alloc(1024)]));
}

function createTarEntry(filePath, fileContent) {
  const fileBuffer = Buffer.from(fileContent, 'utf8');
  const headerBuffer = Buffer.alloc(512, 0);

  writeTarHeaderField(headerBuffer, 0, 100, filePath);
  writeTarHeaderField(headerBuffer, 100, 8, '0000644');
  writeTarHeaderField(headerBuffer, 108, 8, '0000000');
  writeTarHeaderField(headerBuffer, 116, 8, '0000000');
  writeTarHeaderField(headerBuffer, 124, 12, fileBuffer.length.toString(8));
  writeTarHeaderField(headerBuffer, 136, 12, Math.floor(Date.now() / 1000).toString(8));
  writeTarHeaderField(headerBuffer, 148, 8, '        ');
  headerBuffer[156] = '0'.charCodeAt(0);
  writeTarHeaderField(headerBuffer, 257, 6, 'ustar');
  writeTarHeaderField(headerBuffer, 263, 2, '00');

  const checksumValue = headerBuffer.reduce((sum, value) => sum + value, 0);
  writeTarHeaderField(headerBuffer, 148, 8, checksumValue.toString(8).padStart(6, '0'));

  const paddingLength = (512 - (fileBuffer.length % 512)) % 512;

  return [headerBuffer, fileBuffer, Buffer.alloc(paddingLength)];
}

function writeTarHeaderField(headerBuffer, startOffset, fieldLength, value) {
  const valueBuffer = Buffer.from(value, 'utf8');
  valueBuffer.copy(headerBuffer, startOffset, 0, Math.min(valueBuffer.length, fieldLength - 1));
}
