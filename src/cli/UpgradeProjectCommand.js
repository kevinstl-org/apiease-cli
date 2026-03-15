import { ProjectUpgradePlanService } from '../project/ProjectUpgradePlanService.js';
import { TemplateProjectManifestBuilder } from '../template/TemplateProjectManifestBuilder.js';
import { ProjectMetadataFileService } from '../project/ProjectMetadataFileService.js';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';
import { TemplateProjectVersionResolver } from '../template/TemplateProjectVersionResolver.js';

const CHECK_FLAG = '--check';
const DRY_RUN_FLAG = '--dry-run';
const TEMPLATE_MANIFEST_NOT_FOUND_ERROR_CODE = 'APIEASE_PROJECT_TEMPLATE_MANIFEST_NOT_FOUND';
const USAGE_TEXT = 'Usage: apiease upgrade [--check] [--dry-run]';

class UpgradeProjectCommand {
  constructor({
    projectUpgradePlanService = new ProjectUpgradePlanService(),
    projectMetadataFileService = new ProjectMetadataFileService(),
    templateProjectManifestBuilder = new TemplateProjectManifestBuilder(),
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    templateProjectVersionResolver = new TemplateProjectVersionResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.projectUpgradePlanService = projectUpgradePlanService;
    this.projectMetadataFileService = projectMetadataFileService;
    this.templateProjectManifestBuilder = templateProjectManifestBuilder;
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

    if (parseResult.mode === 'dryRun') {
      const storedTemplateManifest = projectMetadataResult.projectMetadata.template?.manifest;
      if (!storedTemplateManifest) {
        this.stderr.write(this.buildFailureOutput({
          errorCode: TEMPLATE_MANIFEST_NOT_FOUND_ERROR_CODE,
          message: 'APIEASE project metadata does not include a template manifest. Run "apiease init" again to adopt the current project state.',
        }));
        return 1;
      }

      const currentTemplateManifest = await this.templateProjectManifestBuilder.buildTemplateManifest(
        templateSource.templateDirectoryPath,
      );
      const upgradePlan = await this.projectUpgradePlanService.buildUpgradePlan({
        currentProjectDirectoryPath: currentWorkingDirectoryPath,
        currentTemplateManifest,
        storedTemplateManifest,
      });

      this.stdout.write(
        this.buildDryRunOutput({
          currentProjectTemplateVersion,
          templateVersion,
          upgradePlan,
        }),
      );
      return this.hasPlannedChanges(upgradePlan) ? 1 : 0;
    }

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

    if (
      commandArguments.length > 2 ||
      (commandArguments[1] && ![CHECK_FLAG, DRY_RUN_FLAG].includes(commandArguments[1]))
    ) {
      return {
        ok: false,
        message: 'Only the optional --check and --dry-run flags are supported.',
      };
    }

    return {
      ok: true,
      mode: commandArguments[1] === DRY_RUN_FLAG ? 'dryRun' : 'check',
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

  buildDryRunOutput({ currentProjectTemplateVersion, templateVersion, upgradePlan }) {
    const outputLines = [
      'APIEASE project upgrade dry run.',
      `Current project template version: ${currentProjectTemplateVersion}`,
      `Latest template version: ${templateVersion.value}`,
      '',
    ];

    this.appendSection(outputLines, 'Add:', upgradePlan.addPaths);
    this.appendSection(outputLines, 'Update:', upgradePlan.updatePaths);
    this.appendSection(outputLines, 'Remove:', upgradePlan.removePaths);
    this.appendSection(outputLines, 'Skip conflict:', upgradePlan.skipPaths);

    return outputLines.join('\n');
  }

  appendSection(outputLines, heading, paths) {
    if (paths.length === 0) {
      return;
    }

    outputLines.push(heading);
    outputLines.push(...paths);
    outputLines.push('');
  }

  hasPlannedChanges(upgradePlan) {
    return [
      ...upgradePlan.addPaths,
      ...upgradePlan.removePaths,
      ...upgradePlan.skipPaths,
      ...upgradePlan.updatePaths,
    ].length > 0;
  }
}

export { UpgradeProjectCommand };
