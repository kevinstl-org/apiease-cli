import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const upgradeProjectCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'UpgradeProjectCommand.js'),
).href;

describe('UpgradeProjectCommand', () => {
  describe('run', () => {
    it('should report success when the project template version matches the current template version', async () => {
      // Arrange
      const { UpgradeProjectCommand } = await import(upgradeProjectCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const upgradeProjectCommand = new UpgradeProjectCommand({
        projectMetadataFileService: {
          async readProjectMetadata() {
            return {
              ok: true,
              projectMetadata: {
                template: {
                  version: {
                    type: 'gitCommit',
                    value: 'template-sha-1',
                  },
                },
              },
            };
          },
        },
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              templateDirectoryPath: '/tmp/apiease-template',
            };
          },
        },
        templateProjectVersionResolver: {
          async resolveTemplateVersion() {
            return {
              type: 'gitCommit',
              value: 'template-sha-1',
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await upgradeProjectCommand.run(['upgrade', '--check']);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(stdoutChunks.join(''), 'APIEASE project template is up to date.\n');
      assert.equal(stderrChunks.join(''), '');
    });

    it('should report a pending upgrade when the current template version differs from the stored project metadata', async () => {
      // Arrange
      const { UpgradeProjectCommand } = await import(upgradeProjectCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const upgradeProjectCommand = new UpgradeProjectCommand({
        projectMetadataFileService: {
          async readProjectMetadata() {
            return {
              ok: true,
              projectMetadata: {
                template: {
                  version: {
                    type: 'gitCommit',
                    value: 'template-sha-1',
                  },
                },
              },
            };
          },
        },
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              templateDirectoryPath: '/tmp/apiease-template',
            };
          },
        },
        templateProjectVersionResolver: {
          async resolveTemplateVersion() {
            return {
              type: 'gitCommit',
              value: 'template-sha-2',
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await upgradeProjectCommand.run(['upgrade', '--check']);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(
        stdoutChunks.join(''),
        [
          'APIEASE project template upgrade is available.',
          'Current project template version: template-sha-1',
          'Latest template version: template-sha-2',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should return a structured failure when the project metadata file is missing', async () => {
      // Arrange
      const { UpgradeProjectCommand } = await import(upgradeProjectCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const upgradeProjectCommand = new UpgradeProjectCommand({
        projectMetadataFileService: {
          async readProjectMetadata() {
            return {
              ok: false,
              errorCode: 'APIEASE_PROJECT_METADATA_NOT_FOUND',
              message: 'Missing metadata',
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await upgradeProjectCommand.run(['upgrade', '--check']);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.join(''), '');
      assert.equal(
        stderrChunks.join(''),
        [
          'APIEASE project upgrade check failed.',
          'Error Code: APIEASE_PROJECT_METADATA_NOT_FOUND',
          'Message: Missing metadata',
          '',
        ].join('\n'),
      );
    });

    it('should report the upgrade plan in dry run mode', async () => {
      // Arrange
      const { UpgradeProjectCommand } = await import(upgradeProjectCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const upgradeProjectCommand = new UpgradeProjectCommand({
        projectMetadataFileService: {
          async readProjectMetadata() {
            return {
              ok: true,
              projectMetadata: {
                template: {
                  manifest: {
                    'updated.txt': 'old-hash',
                  },
                  version: {
                    type: 'gitCommit',
                    value: 'template-sha-1',
                  },
                },
              },
            };
          },
        },
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              templateDirectoryPath: '/tmp/apiease-template',
            };
          },
        },
        templateProjectVersionResolver: {
          async resolveTemplateVersion() {
            return {
              type: 'gitCommit',
              value: 'template-sha-2',
            };
          },
        },
        templateProjectManifestBuilder: {
          async buildTemplateManifest() {
            return {
              'updated.txt': 'new-hash',
              'added.txt': 'added-hash',
            };
          },
        },
        projectUpgradePlanService: {
          async buildUpgradePlan() {
            return {
              addPaths: ['added.txt'],
              removePaths: ['removed.txt'],
              skipPaths: ['conflict.txt'],
              updatePaths: ['updated.txt'],
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await upgradeProjectCommand.run(['upgrade', '--dry-run']);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(
        stdoutChunks.join(''),
        [
          'APIEASE project upgrade dry run.',
          'Current project template version: template-sha-1',
          'Latest template version: template-sha-2',
          '',
          'Add:',
          'added.txt',
          '',
          'Update:',
          'updated.txt',
          '',
          'Remove:',
          'removed.txt',
          '',
          'Skip conflict:',
          'conflict.txt',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should fail dry run when the stored project metadata does not include a template manifest', async () => {
      // Arrange
      const { UpgradeProjectCommand } = await import(upgradeProjectCommandModuleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const upgradeProjectCommand = new UpgradeProjectCommand({
        projectMetadataFileService: {
          async readProjectMetadata() {
            return {
              ok: true,
              projectMetadata: {
                template: {
                  version: {
                    type: 'gitCommit',
                    value: 'template-sha-1',
                  },
                },
              },
            };
          },
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await upgradeProjectCommand.run(['upgrade', '--dry-run']);

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.join(''), '');
      assert.equal(
        stderrChunks.join(''),
        [
          'APIEASE project upgrade check failed.',
          'Error Code: APIEASE_PROJECT_TEMPLATE_MANIFEST_NOT_FOUND',
          'Message: APIEASE project metadata does not include a template manifest. Run "apiease init" again to adopt the current project state.',
          '',
        ].join('\n'),
      );
    });
  });
});

function createWritableStream(chunks) {
  return {
    write(chunk) {
      chunks.push(chunk);
    },
  };
}
