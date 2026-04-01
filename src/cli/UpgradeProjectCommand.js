import { ProjectMetadataFileService } from '../project/ProjectMetadataFileService.js';
import { ProjectUpgradeApplierService } from '../project/ProjectUpgradeApplierService.js';
import { ProjectUpgradePlanService } from '../project/ProjectUpgradePlanService.js';
import { TemplateProjectManifestBuilder } from '../template/TemplateProjectManifestBuilder.js';
import { TemplateProjectOwnershipPolicy } from '../template/TemplateProjectOwnershipPolicy.js';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';
import { TemplateProjectVersionResolver } from '../template/TemplateProjectVersionResolver.js';

const CHECK_FLAG = '--check';
const DRY_RUN_FLAG = '--dry-run';
const TEMPLATE_MANIFEST_NOT_FOUND_ERROR_CODE = 'APIEASE_PROJECT_TEMPLATE_MANIFEST_NOT_FOUND';
const USAGE_TEXT = 'Usage: apiease upgrade [--check] [--dry-run]';

class UpgradeProjectCommand {
  constructor({
    projectUpgradePlanService = new ProjectUpgradePlanService(),
    projectUpgradeApplierService = new ProjectUpgradeApplierService(),
    projectMetadataFileService = new ProjectMetadataFileService(),
    templateProjectManifestBuilder = new TemplateProjectManifestBuilder(),
    templateProjectOwnershipPolicy = new TemplateProjectOwnershipPolicy(),
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    templateProjectVersionResolver = new TemplateProjectVersionResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.projectUpgradePlanService = projectUpgradePlanService;
    this.projectUpgradeApplierService = projectUpgradeApplierService;
    this.projectMetadataFileService = projectMetadataFileService;
    this.templateProjectManifestBuilder = templateProjectManifestBuilder;
    this.templateProjectOwnershipPolicy = templateProjectOwnershipPolicy;
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
      const upgradePlanResult = await this.tryBuildUpgradePlan({
        currentWorkingDirectoryPath,
        projectMetadata: projectMetadataResult.projectMetadata,
        templateSource,
      });
      if (!upgradePlanResult.ok) {
        this.stderr.write(this.buildFailureOutput(upgradePlanResult));
        return 1;
      }

      this.stdout.write(
        this.buildDryRunOutput({
          currentProjectTemplateVersion,
          templateVersion,
          upgradePlan: upgradePlanResult.upgradePlan,
        }),
      );
      return this.hasPlannedChanges(upgradePlanResult.upgradePlan) ? 1 : 0;
    }

    if (parseResult.mode === 'check' && currentProjectTemplateVersion === templateVersion.value) {
      this.stdout.write('APIEASE project template is up to date.\n');
      return 0;
    }

    if (parseResult.mode === 'apply') {
      const upgradePlanResult = await this.tryBuildUpgradePlan({
        currentWorkingDirectoryPath,
        projectMetadata: projectMetadataResult.projectMetadata,
        templateSource,
      });
      if (!upgradePlanResult.ok) {
        this.stderr.write(this.buildFailureOutput(upgradePlanResult));
        return 1;
      }

      const applyResult = await this.tryApplyUpgradePlan({
        currentProjectDirectoryPath: currentWorkingDirectoryPath,
        templateDirectoryPath: templateSource.templateDirectoryPath,
        upgradePlan: upgradePlanResult.upgradePlan,
      });
      if (!applyResult.ok) {
        this.stderr.write(this.buildFailureOutput(applyResult));
        return 1;
      }

      await this.projectMetadataFileService.writeProjectMetadata({
        projectDirectoryPath: currentWorkingDirectoryPath,
        projectMetadata: this.buildUpdatedProjectMetadata({
          currentTemplateManifest: upgradePlanResult.currentTemplateManifest,
          projectMetadata: projectMetadataResult.projectMetadata,
          templateSource,
          templateVersion: upgradePlanResult.upgradePlan.skipPaths.length === 0
            ? templateVersion
            : projectMetadataResult.projectMetadata.template.version,
          upgradePlan: upgradePlanResult.upgradePlan,
        }),
      });
      this.stdout.write(
        this.buildApplyOutput({
          currentProjectTemplateVersion,
          templateVersion,
          upgradePlan: upgradePlanResult.upgradePlan,
        }),
      );
      return upgradePlanResult.upgradePlan.skipPaths.length === 0 ? 0 : 1;
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

  async tryBuildUpgradePlan({ currentWorkingDirectoryPath, projectMetadata, templateSource }) {
    try {
      return await this.buildUpgradePlan({
        currentWorkingDirectoryPath,
        projectMetadata,
        templateSource,
      });
    } catch (error) {
      return this.buildManagedPathFailureResult(error);
    }
  }

  async tryApplyUpgradePlan({ currentProjectDirectoryPath, templateDirectoryPath, upgradePlan }) {
    try {
      await this.projectUpgradeApplierService.applyUpgradePlan({
        currentProjectDirectoryPath,
        templateDirectoryPath,
        upgradePlan,
      });
      return { ok: true };
    } catch (error) {
      return this.buildManagedPathFailureResult(error);
    }
  }

  async buildUpgradePlan({ currentWorkingDirectoryPath, projectMetadata, templateSource }) {
    const storedTemplateManifest = projectMetadata.template?.manifest;
    if (!storedTemplateManifest) {
      return {
        ok: false,
        ...this.buildManifestNotFoundFailure(),
      };
    }

    const currentTemplateManifest = await this.templateProjectManifestBuilder.buildTemplateManifest(
      templateSource.templateDirectoryPath,
    );
    const managedStoredTemplateManifest = this.templateProjectOwnershipPolicy.filterTemplateManifest(
      storedTemplateManifest,
    );

    return {
      currentTemplateManifest,
      ok: true,
      upgradePlan: await this.projectUpgradePlanService.buildUpgradePlan({
        currentProjectDirectoryPath: currentWorkingDirectoryPath,
        currentTemplateManifest,
        storedTemplateManifest: managedStoredTemplateManifest,
      }),
    };
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
      mode:
        commandArguments[1] === CHECK_FLAG
          ? 'check'
          : commandArguments[1] === DRY_RUN_FLAG
            ? 'dryRun'
            : 'apply',
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

  buildManifestNotFoundFailure() {
    return {
      errorCode: TEMPLATE_MANIFEST_NOT_FOUND_ERROR_CODE,
      message: 'APIEASE project metadata does not include a template manifest. Run "apiease init" again to adopt the current project state.',
    };
  }

  buildManagedPathFailureResult(error) {
    if (error?.code !== 'APIEASE_INVALID_MANAGED_PATH') {
      throw error;
    }

    return {
      ok: false,
      errorCode: error.code,
      message: error.message,
    };
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

  buildApplyOutput({ currentProjectTemplateVersion, templateVersion, upgradePlan }) {
    const outputLines = [
      upgradePlan.skipPaths.length === 0
        ? 'APIEASE project template upgraded successfully.'
        : 'APIEASE project template upgrade applied with conflicts.',
      `Current project template version: ${currentProjectTemplateVersion}`,
      `Latest template version: ${templateVersion.value}`,
      '',
    ];

    this.appendSection(outputLines, 'Added:', upgradePlan.addPaths);
    this.appendSection(outputLines, 'Updated:', upgradePlan.updatePaths);
    this.appendSection(outputLines, 'Removed:', upgradePlan.removePaths);
    this.appendSection(outputLines, 'Skipped conflicting paths:', upgradePlan.skipPaths);

    return outputLines.join('\n');
  }

  buildUpdatedProjectMetadata({ currentTemplateManifest, projectMetadata, templateSource, templateVersion, upgradePlan }) {
    return {
      ...projectMetadata,
      template: {
        ...projectMetadata.template,
        displayTemplateSource: templateSource.displayTemplateSource,
        manifest: this.buildUpdatedTemplateManifest({
          currentTemplateManifest,
          storedTemplateManifest: projectMetadata.template.manifest,
          upgradePlan,
        }),
        publicRepositoryUrl: templateSource.publicRepositoryUrl,
        sourceType: templateSource.sourceType,
        version: templateVersion,
      },
    };
  }

  buildUpdatedTemplateManifest({ currentTemplateManifest, storedTemplateManifest, upgradePlan }) {
    const updatedTemplateManifest = {};
    const skippedPaths = new Set(upgradePlan.skipPaths);
    const managedPaths = new Set([
      ...Object.keys(currentTemplateManifest),
      ...Object.keys(storedTemplateManifest),
    ]);

    for (const managedPath of [...managedPaths].sort()) {
      if (skippedPaths.has(managedPath)) {
        if (storedTemplateManifest[managedPath]) {
          updatedTemplateManifest[managedPath] = storedTemplateManifest[managedPath];
        }

        continue;
      }

      if (currentTemplateManifest[managedPath]) {
        updatedTemplateManifest[managedPath] = currentTemplateManifest[managedPath];
      }
    }

    return updatedTemplateManifest;
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
