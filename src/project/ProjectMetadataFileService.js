import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_METADATA_NOT_FOUND_ERROR_CODE = 'APIEASE_PROJECT_METADATA_NOT_FOUND';
const PROJECT_METADATA_INVALID_ERROR_CODE = 'APIEASE_PROJECT_METADATA_INVALID';

class ProjectMetadataFileService {
  async writeProjectMetadata({ projectDirectoryPath, projectMetadata }) {
    const projectMetadataFilePath = this.buildProjectMetadataFilePath(projectDirectoryPath);
    await fs.mkdir(path.dirname(projectMetadataFilePath), { recursive: true });
    await fs.writeFile(projectMetadataFilePath, `${JSON.stringify(projectMetadata, null, 2)}\n`);
  }

  async readProjectMetadata(projectDirectoryPath) {
    const projectMetadataFilePath = this.buildProjectMetadataFilePath(projectDirectoryPath);

    try {
      const fileContent = await fs.readFile(projectMetadataFilePath, 'utf8');
      return {
        ok: true,
        projectMetadata: JSON.parse(fileContent),
      };
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return {
          ok: false,
          errorCode: PROJECT_METADATA_NOT_FOUND_ERROR_CODE,
          message: `APIEASE project metadata not found at ${projectMetadataFilePath}. Run "apiease init" first.`,
        };
      }

      if (error instanceof SyntaxError) {
        return {
          ok: false,
          errorCode: PROJECT_METADATA_INVALID_ERROR_CODE,
          message: `APIEASE project metadata is invalid at ${projectMetadataFilePath}.`,
        };
      }

      throw error;
    }
  }

  buildProjectMetadataFilePath(projectDirectoryPath) {
    return path.join(projectDirectoryPath, '.apiease', 'project.json');
  }
}

export { ProjectMetadataFileService };
