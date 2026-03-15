import fs from 'node:fs/promises';
import path from 'node:path';
import { TemplateProjectSourceResolver } from '../template/TemplateProjectSourceResolver.js';

const EXCLUDED_DIRECTORY_NAMES = new Set(['.git', 'node_modules']);
const USAGE_TEXT = 'Usage: apiease init <project-name>';

class InitProjectCommand {
  constructor({
    templateProjectSourceResolver = new TemplateProjectSourceResolver(),
    stdout = process.stdout,
    stderr = process.stderr,
  } = {}) {
    this.templateProjectSourceResolver = templateProjectSourceResolver;
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
    const destinationValidationResult = await this.validateDestinationDirectory(destinationDirectoryPath);

    if (!destinationValidationResult.ok) {
      this.stderr.write(`${destinationValidationResult.message}\n`);
      return 1;
    }

    await fs.mkdir(destinationDirectoryPath, { recursive: true });

    this.stdout.write(this.buildStartOutput({
      displayTemplateSource: templateSource.displayTemplateSource,
      projectName: parseResult.projectName,
    }));

    await fs.cp(templateSource.templateDirectoryPath, destinationDirectoryPath, {
      recursive: true,
      filter: (sourcePath) => this.shouldCopyPath(sourcePath),
    });

    this.stdout.write(this.buildSuccessOutput(parseResult.projectName));
    return 0;
  }

  parseCommandArguments(commandArguments) {
    if (commandArguments[0] !== 'init') {
      return {
        ok: false,
        message: 'Unsupported init command arguments.',
      };
    }

    if (commandArguments.length !== 2 || !commandArguments[1]) {
      return {
        ok: false,
        message: 'Project name is required.',
      };
    }

    return {
      ok: true,
      projectName: commandArguments[1],
    };
  }

  async validateDestinationDirectory(destinationDirectoryPath) {
    try {
      const destinationDirectoryEntries = await fs.readdir(destinationDirectoryPath);

      if (destinationDirectoryEntries.length > 0) {
        return {
          ok: false,
          message: `Destination directory already exists and is not empty: ${destinationDirectoryPath}`,
        };
      }

      return {
        ok: true,
      };
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return {
          ok: true,
        };
      }

      throw error;
    }
  }

  shouldCopyPath(sourcePath) {
    return !this.buildPathSegments(sourcePath).some((pathSegment) => EXCLUDED_DIRECTORY_NAMES.has(pathSegment));
  }

  buildPathSegments(sourcePath) {
    return path.normalize(sourcePath).split(path.sep).filter(Boolean);
  }

  buildStartOutput({ displayTemplateSource, projectName }) {
    return [
      `Creating APIEase project: ${projectName}`,
      `Using template: ${displayTemplateSource}`,
      '',
    ].join('\n');
  }

  buildSuccessOutput(projectName) {
    return [
      'Project created successfully.',
      '',
      'Next steps:',
      `cd ${projectName}`,
      'git init',
      '',
    ].join('\n');
  }
}

export { InitProjectCommand };
