import { ProjectMetadataFileService } from '../project/ProjectMetadataFileService.js';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';
import { TemplateProjectVersionResolver } from '../template/TemplateProjectVersionResolver.js';

const CHECK_FLAG = '--check';
const USAGE_TEXT = 'Usage: apiease upgrade [--check]';

class UpgradeProjectCommand {
  constructor({
    projectMetadataFileService = new ProjectMetadataFileService(),
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    templateProjectVersionResolver = new TemplateProjectVersionResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.projectMetadataFileService = projectMetadataFileService;
    this.templateProjectSourceResolver = templateProjectSourceResolver;
    this.templateProjectVersionResolver = templateProjectVersionResolver;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(commandArguments = [], { currentWorkingDirectoryPath = process.cwd() } = {}) {
    const parseResult = this.parseCommandArguments(commandArguments);
    if (!parseResult.ok) {
      this.stderr.write(`${parseResult.message}\n${USAGE_TEXT}\n`);
      return 1;
    }

    const projectMetadataResult = await this.projectMetadataFileService.readProjectMetadata(currentWorkingDirectoryPath);
    if (!projectMetadataResult.ok) {
      this.stderr.write(this.buildFailureOutput(projectMetadataResult));
      return 1;
    }

    const templateSource = this.templateProjectSourceResolver.resolveTemplateSource();
    const templateVersion = await this.templateProjectVersionResolver.resolveTemplateVersion(
      templateSource.templateDirectoryPath,
    );
    const currentProjectTemplateVersion = projectMetadataResult.projectMetadata.template?.version?.value;

    if (currentProjectTemplateVersion === templateVersion.value) {
      this.stdout.write('APIEASE project template is up to date.\n');
      return 0;
    }

    this.stdout.write(
      [
        'APIEASE project template upgrade is available.',
        `Current project template version: ${currentProjectTemplateVersion}`,
        `Latest template version: ${templateVersion.value}`,
        '',
      ].join('\n'),
    );
    return 1;
  }

  parseCommandArguments(commandArguments) {
    if (commandArguments[0] !== 'upgrade') {
      return {
        ok: false,
        message: 'Unsupported upgrade command arguments.',
      };
    }

    if (commandArguments.length > 2 || (commandArguments[1] && commandArguments[1] !== CHECK_FLAG)) {
      return {
        ok: false,
        message: 'Only the optional --check flag is supported.',
      };
    }

    return {
      ok: true,
    };
  }

  buildFailureOutput(projectMetadataResult) {
    return [
      'APIEASE project upgrade check failed.',
      `Error Code: ${projectMetadataResult.errorCode}`,
      `Message: ${projectMetadataResult.message}`,
      '',
    ].join('\n');
  }
}

export { UpgradeProjectCommand };
