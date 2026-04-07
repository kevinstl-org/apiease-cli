import fs from 'node:fs/promises';
import path from 'node:path';
import { ProjectMetadataFileService } from '../project/ProjectMetadataFileService.js';
import { TemplateProjectManifestBuilder } from '../template/TemplateProjectManifestBuilder.js';
import { TemplateProjectOwnershipPolicy } from '../template/TemplateProjectOwnershipPolicy.js';
import { TemplateProjectSourceMaterializer } from '../template/TemplateProjectSourceMaterializer.js';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';
import { TemplateProjectVersionResolver } from '../template/TemplateProjectVersionResolver.js';

const EXCLUDED_DIRECTORY_NAMES = new Set(['.git', '.idea', '.codex', 'node_modules']);
const USAGE_TEXT = 'Usage: apiease init [project-name]';

class InitProjectCommand {
  constructor({
    cliVersion,
    projectMetadataFileService = new ProjectMetadataFileService(),
    templateProjectManifestBuilder = new TemplateProjectManifestBuilder(),
    templateProjectOwnershipPolicy = new TemplateProjectOwnershipPolicy(),
    templateProjectSourceMaterializer = new TemplateProjectSourceMaterializer(),
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    templateProjectVersionResolver = new TemplateProjectVersionResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.cliVersion = cliVersion;
    this.projectMetadataFileService = projectMetadataFileService;
    this.templateProjectManifestBuilder = templateProjectManifestBuilder;
    this.templateProjectOwnershipPolicy = templateProjectOwnershipPolicy;
    this.templateProjectSourceMaterializer = templateProjectSourceMaterializer;
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

    const templateSource = this.templateProjectSourceResolver.resolveTemplateSource();
    const materializedTemplate = await this.templateProjectSourceMaterializer.materializeTemplateSource(templateSource);
    const destinationDirectoryPath = path.resolve(currentWorkingDirectoryPath, parseResult.projectName);
    const destinationAlreadyExists = (await this.readPathStats(destinationDirectoryPath)) !== null;
    const destinationValidationResult = await this.validateDestinationDirectoryPath(destinationDirectoryPath);

    if (!destinationValidationResult.ok) {
      this.stderr.write(`${destinationValidationResult.message}\n`);
      await materializedTemplate.cleanup();
      return 1;
    }

    try {
      const copyPlan = await this.buildTemplateCopyPlan(
        materializedTemplate.templateDirectoryPath,
        destinationDirectoryPath,
      );

      await fs.mkdir(destinationDirectoryPath, { recursive: true });

      this.stdout.write(this.buildStartOutput({
        destinationAlreadyExists,
        displayTemplateSource: templateSource.displayTemplateSource,
        projectName: parseResult.projectName,
      }));

      await this.copyTemplateEntries(materializedTemplate.templateDirectoryPath, destinationDirectoryPath);

      const templateVersion = materializedTemplate.templateVersion
        ?? await this.templateProjectVersionResolver.resolveTemplateVersion(materializedTemplate.templateDirectoryPath);
      const templateManifest = await this.templateProjectManifestBuilder.buildTemplateManifest(
        materializedTemplate.templateDirectoryPath,
      );
      await this.projectMetadataFileService.writeProjectMetadata({
        projectDirectoryPath: destinationDirectoryPath,
        projectMetadata: this.buildProjectMetadata({
          destinationDirectoryPath,
          skippedPaths: copyPlan.skippedPaths,
          templateManifest,
          templateSource,
          templateVersion,
        }),
      });

      const hasExistingGitDirectory = await this.hasGitDirectory(destinationDirectoryPath);
      this.stdout.write(
        this.buildSuccessOutput({
          destinationAlreadyExists,
          hasExistingGitDirectory,
          projectName: parseResult.projectName,
          skippedPaths: copyPlan.skippedPaths,
        }),
      );
      return 0;
    } finally {
      await materializedTemplate.cleanup();
    }
  }

  parseCommandArguments(commandArguments) {
    if (commandArguments[0] !== 'init') {
      return {
        ok: false,
        message: 'Unsupported init command arguments.',
      };
    }

    if (commandArguments.length > 2) {
      return {
        ok: false,
        message: 'Only one optional project name argument is supported.',
      };
    }

    return {
      ok: true,
      projectName: commandArguments[1] ?? '.',
    };
  }

  async validateDestinationDirectoryPath(destinationDirectoryPath) {
    const destinationPathStats = await this.readPathStats(destinationDirectoryPath);
    if (!destinationPathStats) {
      return {
        ok: true,
      };
    }

    if (destinationPathStats.isDirectory()) {
      return {
        ok: true,
      };
    }

    return {
      ok: false,
      message: `Destination path already exists and is not a directory: ${destinationDirectoryPath}`,
    };
  }

  async buildTemplateCopyPlan(
    templateDirectoryPath,
    destinationDirectoryPath,
    skippedPaths = [],
    rootTemplateDirectoryPath = templateDirectoryPath,
  ) {
    const templateEntries = await fs.readdir(templateDirectoryPath, { withFileTypes: true });

    for (const templateEntry of templateEntries) {
      if (EXCLUDED_DIRECTORY_NAMES.has(templateEntry.name)) {
        continue;
      }

      const templateEntryPath = path.join(templateDirectoryPath, templateEntry.name);
      const destinationEntryPath = path.join(destinationDirectoryPath, templateEntry.name);
      const destinationEntryStats = await this.readPathStats(destinationEntryPath);
      const templateRelativePath = this.buildTemplateRelativePath({
        rootTemplateDirectoryPath,
        templateEntryPath,
      });

      if (!destinationEntryStats) {
        continue;
      }

      if (templateEntry.isDirectory() && destinationEntryStats.isDirectory()) {
        await this.buildTemplateCopyPlan(
          templateEntryPath,
          destinationEntryPath,
          skippedPaths,
          rootTemplateDirectoryPath,
        );
        continue;
      }

      if (
        templateEntry.isFile()
        && destinationEntryStats.isFile()
        && this.templateProjectOwnershipPolicy.shouldAlwaysRefreshPath(templateRelativePath)
      ) {
        continue;
      }

      if (
        templateEntry.isFile() &&
        destinationEntryStats.isFile() &&
        (await this.areFilesIdentical(templateEntryPath, destinationEntryPath))
      ) {
        continue;
      }

      skippedPaths.push(destinationEntryPath);
    }

    return {
      ok: true,
      skippedPaths,
    };
  }

  async copyTemplateEntries(
    templateDirectoryPath,
    destinationDirectoryPath,
    rootTemplateDirectoryPath = templateDirectoryPath,
  ) {
    const templateEntries = await fs.readdir(templateDirectoryPath, { withFileTypes: true });

    for (const templateEntry of templateEntries) {
      if (EXCLUDED_DIRECTORY_NAMES.has(templateEntry.name)) {
        continue;
      }

      const templateEntryPath = path.join(templateDirectoryPath, templateEntry.name);
      const destinationEntryPath = path.join(destinationDirectoryPath, templateEntry.name);
      const destinationEntryStats = await this.readPathStats(destinationEntryPath);
      const templateRelativePath = this.buildTemplateRelativePath({
        rootTemplateDirectoryPath,
        templateEntryPath,
      });

      if (!destinationEntryStats) {
        await fs.cp(templateEntryPath, destinationEntryPath, { recursive: true });
        continue;
      }

      if (
        templateEntry.isFile()
        && destinationEntryStats.isFile()
        && this.templateProjectOwnershipPolicy.shouldAlwaysRefreshPath(templateRelativePath)
      ) {
        await fs.copyFile(templateEntryPath, destinationEntryPath);
        continue;
      }

      if (templateEntry.isDirectory() && destinationEntryStats.isDirectory()) {
        await this.copyTemplateEntries(
          templateEntryPath,
          destinationEntryPath,
          rootTemplateDirectoryPath,
        );
      }
    }
  }

  async readPathStats(targetPath) {
    try {
      return await fs.lstat(targetPath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  }

  async hasGitDirectory(destinationDirectoryPath) {
    const gitDirectoryStats = await this.readPathStats(path.join(destinationDirectoryPath, '.git'));
    return gitDirectoryStats?.isDirectory() === true;
  }

  async areFilesIdentical(templateEntryPath, destinationEntryPath) {
    const [templateContent, destinationContent] = await Promise.all([
      fs.readFile(templateEntryPath),
      fs.readFile(destinationEntryPath),
    ]);

    return templateContent.equals(destinationContent);
  }

  shouldCopyPath(sourcePath) {
    return !this.buildPathSegments(sourcePath).some((pathSegment) => EXCLUDED_DIRECTORY_NAMES.has(pathSegment));
  }

  buildPathSegments(sourcePath) {
    return path.normalize(sourcePath).split(path.sep).filter(Boolean);
  }

  buildTemplateRelativePath({ rootTemplateDirectoryPath, templateEntryPath }) {
    return path.relative(rootTemplateDirectoryPath, templateEntryPath).split(path.sep).join('/');
  }

  buildStartOutput({ destinationAlreadyExists, displayTemplateSource, projectName }) {
    return [
      `${destinationAlreadyExists ? 'Initializing' : 'Creating'} APIEase project: ${projectName}`,
      `Using template: ${displayTemplateSource}`,
      '',
    ].join('\n');
  }

  buildSuccessOutput({ destinationAlreadyExists, hasExistingGitDirectory, projectName, skippedPaths = [] }) {
    const nextStepLines = [];

    if (projectName !== '.') {
      nextStepLines.push(`cd ${projectName}`);
    }

    if (!hasExistingGitDirectory) {
      nextStepLines.push('git init');
    }

    const outputLines = [
      destinationAlreadyExists ? 'Project initialized successfully.' : 'Project created successfully.',
      '',
    ];

    if (skippedPaths.length > 0) {
      outputLines.push('Skipped existing conflicting paths:');
      outputLines.push(...skippedPaths.map((skippedPath) => path.basename(skippedPath)));
      outputLines.push('');
    }

    if (nextStepLines.length > 0) {
      outputLines.push('Next steps:');
      outputLines.push(...nextStepLines);
      outputLines.push('');
    }

    return outputLines.join('\n');
  }

  buildProjectMetadata({
    destinationDirectoryPath,
    skippedPaths,
    templateManifest,
    templateSource,
    templateVersion,
  }) {
    return {
      cliVersion: this.cliVersion,
      template: {
        displayTemplateSource: templateSource.displayTemplateSource,
        manifest: this.buildStoredTemplateManifest({
          destinationDirectoryPath,
          skippedPaths,
          templateManifest,
        }),
        publicRepositoryUrl: templateSource.publicRepositoryUrl,
        sourceType: templateSource.sourceType,
        version: templateVersion,
      },
    };
  }

  buildStoredTemplateManifest({ destinationDirectoryPath, skippedPaths, templateManifest }) {
    const skippedRelativePaths = new Set(
      skippedPaths.map((skippedPath) => path.relative(destinationDirectoryPath, skippedPath).split(path.sep).join('/')),
    );
    const storedTemplateManifest = {};

    for (const [templatePath, templateHash] of Object.entries(templateManifest)) {
      if (skippedRelativePaths.has(templatePath)) {
        continue;
      }

      storedTemplateManifest[templatePath] = templateHash;
    }

    return storedTemplateManifest;
  }
}

export { InitProjectCommand };
