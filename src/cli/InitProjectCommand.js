import fs from 'node:fs/promises';
import path from 'node:path';
import { ProjectMetadataFileService } from '../project/ProjectMetadataFileService.js';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';
import { TemplateProjectVersionResolver } from '../template/TemplateProjectVersionResolver.js';

const EXCLUDED_DIRECTORY_NAMES = new Set(['.git', '.idea', 'node_modules']);
const USAGE_TEXT = 'Usage: apiease init [project-name]';

class InitProjectCommand {
  constructor({
    cliVersion,
    projectMetadataFileService = new ProjectMetadataFileService(),
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    templateProjectVersionResolver = new TemplateProjectVersionResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.cliVersion = cliVersion;
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

    const templateSource = this.templateProjectSourceResolver.resolveTemplateSource();
    const destinationDirectoryPath = path.resolve(currentWorkingDirectoryPath, parseResult.projectName);
    const destinationAlreadyExists = (await this.readPathStats(destinationDirectoryPath)) !== null;
    const destinationValidationResult = await this.validateDestinationDirectoryPath(destinationDirectoryPath);

    if (!destinationValidationResult.ok) {
      this.stderr.write(`${destinationValidationResult.message}\n`);
      return 1;
    }

    const collisionResult = await this.findTemplateCollision(
      templateSource.templateDirectoryPath,
      destinationDirectoryPath,
    );

    if (!collisionResult.ok) {
      this.stderr.write(`${collisionResult.message}\n`);
      return 1;
    }

    await fs.mkdir(destinationDirectoryPath, { recursive: true });

    this.stdout.write(this.buildStartOutput({
      destinationAlreadyExists,
      displayTemplateSource: templateSource.displayTemplateSource,
      projectName: parseResult.projectName,
    }));

    await fs.cp(templateSource.templateDirectoryPath, destinationDirectoryPath, {
      recursive: true,
      force: false,
      errorOnExist: true,
      filter: (sourcePath) => this.shouldCopyPath(sourcePath),
    });

    const templateVersion = await this.templateProjectVersionResolver.resolveTemplateVersion(
      templateSource.templateDirectoryPath,
    );
    await this.projectMetadataFileService.writeProjectMetadata({
      projectDirectoryPath: destinationDirectoryPath,
      projectMetadata: this.buildProjectMetadata({
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
      }),
    );
    return 0;
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

  async findTemplateCollision(templateDirectoryPath, destinationDirectoryPath) {
    const templateEntries = await fs.readdir(templateDirectoryPath, { withFileTypes: true });

    for (const templateEntry of templateEntries) {
      if (EXCLUDED_DIRECTORY_NAMES.has(templateEntry.name)) {
        continue;
      }

      const templateEntryPath = path.join(templateDirectoryPath, templateEntry.name);
      const destinationEntryPath = path.join(destinationDirectoryPath, templateEntry.name);
      const destinationEntryStats = await this.readPathStats(destinationEntryPath);

      if (!destinationEntryStats) {
        continue;
      }

      if (templateEntry.isDirectory() && destinationEntryStats.isDirectory()) {
        const nestedCollisionResult = await this.findTemplateCollision(templateEntryPath, destinationEntryPath);
        if (!nestedCollisionResult.ok) {
          return nestedCollisionResult;
        }

        continue;
      }

      return {
        ok: false,
        message: `Template copy would overwrite an existing path: ${destinationEntryPath}`,
      };
    }

    return {
      ok: true,
    };
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

  shouldCopyPath(sourcePath) {
    return !this.buildPathSegments(sourcePath).some((pathSegment) => EXCLUDED_DIRECTORY_NAMES.has(pathSegment));
  }

  buildPathSegments(sourcePath) {
    return path.normalize(sourcePath).split(path.sep).filter(Boolean);
  }

  buildStartOutput({ destinationAlreadyExists, displayTemplateSource, projectName }) {
    return [
      `${destinationAlreadyExists ? 'Initializing' : 'Creating'} APIEase project: ${projectName}`,
      `Using template: ${displayTemplateSource}`,
      '',
    ].join('\n');
  }

  buildSuccessOutput({ destinationAlreadyExists, hasExistingGitDirectory, projectName }) {
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

    if (nextStepLines.length > 0) {
      outputLines.push('Next steps:');
      outputLines.push(...nextStepLines);
      outputLines.push('');
    }

    return outputLines.join('\n');
  }

  buildProjectMetadata({ templateSource, templateVersion }) {
    return {
      cliVersion: this.cliVersion,
      template: {
        displayTemplateSource: templateSource.displayTemplateSource,
        publicRepositoryUrl: templateSource.publicRepositoryUrl,
        sourceType: templateSource.sourceType,
        version: templateVersion,
      },
    };
  }
}

export { InitProjectCommand };
