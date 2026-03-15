import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const projectMetadataFileServiceModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'project', 'ProjectMetadataFileService.js'),
).href;

describe('ProjectMetadataFileService', () => {
  describe('writeProjectMetadata', () => {
    it('should write the project metadata file under the .apiease directory', async () => {
      // Arrange
      const { ProjectMetadataFileService } = await import(projectMetadataFileServiceModuleUrl);
      const projectMetadataFileService = new ProjectMetadataFileService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-project-metadata-write-'));
      const projectMetadata = {
        cliVersion: '0.1.0-test',
        template: {
          sourceType: 'localDevelopment',
          displayTemplateSource: '../apiease-template',
          version: {
            type: 'gitCommit',
            value: 'abc123',
          },
        },
      };

      // Act
      await projectMetadataFileService.writeProjectMetadata({
        projectDirectoryPath: temporaryDirectoryPath,
        projectMetadata,
      });

      // Assert
      assert.deepEqual(
        JSON.parse(await fs.readFile(path.join(temporaryDirectoryPath, '.apiease', 'project.json'), 'utf8')),
        projectMetadata,
      );
    });
  });

  describe('readProjectMetadata', () => {
    it('should load the stored project metadata file', async () => {
      // Arrange
      const { ProjectMetadataFileService } = await import(projectMetadataFileServiceModuleUrl);
      const projectMetadataFileService = new ProjectMetadataFileService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-project-metadata-read-'));
      const projectMetadata = {
        cliVersion: '0.1.0-test',
      };

      await fs.mkdir(path.join(temporaryDirectoryPath, '.apiease'), { recursive: true });
      await fs.writeFile(
        path.join(temporaryDirectoryPath, '.apiease', 'project.json'),
        `${JSON.stringify(projectMetadata, null, 2)}\n`,
      );

      // Act
      const result = await projectMetadataFileService.readProjectMetadata(temporaryDirectoryPath);

      // Assert
      assert.deepEqual(result, {
        ok: true,
        projectMetadata,
      });
    });

    it('should return a structured failure when the metadata file does not exist', async () => {
      // Arrange
      const { ProjectMetadataFileService } = await import(projectMetadataFileServiceModuleUrl);
      const projectMetadataFileService = new ProjectMetadataFileService();
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-project-metadata-missing-'));

      // Act
      const result = await projectMetadataFileService.readProjectMetadata(temporaryDirectoryPath);

      // Assert
      assert.deepEqual(result, {
        ok: false,
        errorCode: 'APIEASE_PROJECT_METADATA_NOT_FOUND',
        message: `APIEASE project metadata not found at ${path.join(temporaryDirectoryPath, '.apiease', 'project.json')}. Run "apiease init" first.`,
      });
    });
  });
});
