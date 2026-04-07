import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const initProjectCommandModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'cli', 'InitProjectCommand.js'),
).href;

describe('InitProjectCommand', () => {
  describe('run', () => {
    it('should copy the template into the target project directory while excluding .git, .idea, and node_modules', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(path.join(templateDirectoryPath, '.git'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, '.idea'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, 'node_modules', 'left-pad'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, 'src'), { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, '.git', 'config'), '[core]\nrepositoryformatversion = 0\n');
      await fs.writeFile(path.join(templateDirectoryPath, '.idea', '.gitignore'), '# idea\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'node_modules', 'left-pad', 'index.js'), 'export default 1;\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'package.json'), '{\n  "name": "apiease-template"\n}\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'CUSTOM_README.md'), 'custom readme\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'CUSTOM_AGENT_GUIDANCE.md'), 'custom guidance\n');
      await fs.writeFile(path.join(templateDirectoryPath, '.env'), 'APIEASE=1\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'src', 'index.js'), 'export const app = true;\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
              sourceType: 'localDevelopment',
              templateDirectoryPath,
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
        cliVersion: '0.1.0-test',
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init', 'my-project'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        await fs.readFile(path.join(workingDirectoryPath, 'my-project', 'package.json'), 'utf8'),
        '{\n  "name": "apiease-template"\n}\n',
      );
      assert.equal(
        await fs.readFile(path.join(workingDirectoryPath, 'my-project', '.env'), 'utf8'),
        'APIEASE=1\n',
      );
      assert.equal(
        await fs.readFile(path.join(workingDirectoryPath, 'my-project', 'src', 'index.js'), 'utf8'),
        'export const app = true;\n',
      );
      const projectMetadata = JSON.parse(
        await fs.readFile(path.join(workingDirectoryPath, 'my-project', '.apiease', 'project.json'), 'utf8'),
      );
      assert.equal(projectMetadata.cliVersion, '0.1.0-test');
      assert.equal(projectMetadata.template.displayTemplateSource, '../apiease-template');
      assert.equal(projectMetadata.template.publicRepositoryUrl, 'https://github.com/kevinstl-org/apiease-template');
      assert.equal(projectMetadata.template.sourceType, 'localDevelopment');
      assert.deepEqual(projectMetadata.template.version, {
        type: 'gitCommit',
        value: 'template-sha-1',
      });
      assert.deepEqual(Object.keys(projectMetadata.template.manifest).sort(), [
        '.env',
        'README.md',
        'package.json',
        'src/index.js',
      ]);
      for (const manifestHash of Object.values(projectMetadata.template.manifest)) {
        assert.equal(typeof manifestHash, 'string');
        assert.notEqual(manifestHash.length, 0);
      }
      await assert.rejects(fs.access(path.join(workingDirectoryPath, 'my-project', '.git')));
      await assert.rejects(fs.access(path.join(workingDirectoryPath, 'my-project', '.idea')));
      await assert.rejects(fs.access(path.join(workingDirectoryPath, 'my-project', 'node_modules')));
      assert.equal(
        stdoutChunks.join(''),
        [
          'Creating APIEase project: my-project',
          'Using template: ../apiease-template',
          'Project created successfully.',
          '',
          'Next steps:',
          'cd my-project',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should initialize an existing destination directory when no template paths collide', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-failure-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const destinationDirectoryPath = path.join(workingDirectoryPath, 'my-project');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(templateDirectoryPath, { recursive: true });
      await fs.mkdir(destinationDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'package.json'), '{\n  "name": "apiease-template"\n}\n');
      await fs.writeFile(path.join(destinationDirectoryPath, 'existing.txt'), 'keep me\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      const exitCode = await initProjectCommand.run(['init', 'my-project'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        await fs.readFile(path.join(destinationDirectoryPath, 'package.json'), 'utf8'),
        '{\n  "name": "apiease-template"\n}\n',
      );
      assert.equal(await fs.readFile(path.join(destinationDirectoryPath, 'existing.txt'), 'utf8'), 'keep me\n');
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: my-project',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Next steps:',
          'cd my-project',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should preserve conflicting existing files and report them as skipped', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-collision-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const destinationDirectoryPath = path.join(workingDirectoryPath, 'my-project');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(templateDirectoryPath, { recursive: true });
      await fs.mkdir(destinationDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');
      await fs.writeFile(path.join(destinationDirectoryPath, 'README.md'), 'existing readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      const exitCode = await initProjectCommand.run(['init', 'my-project'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: my-project',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Skipped existing conflicting paths:',
          'README.md',
          '',
          'Next steps:',
          'cd my-project',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
      assert.equal(await fs.readFile(path.join(destinationDirectoryPath, 'README.md'), 'utf8'), 'existing readme\n');
    });

    it('should refresh the bundled knowledge base file even when it already exists', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-knowledge-base-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];
      const knowledgeBaseRelativePath = path.join('docs', 'knowledgebase', 'apiEaseDocsConsolidated.md');

      await fs.mkdir(path.join(templateDirectoryPath, 'docs', 'knowledgebase'), { recursive: true });
      await fs.mkdir(path.join(workingDirectoryPath, 'docs', 'knowledgebase'), { recursive: true });
      await fs.writeFile(
        path.join(templateDirectoryPath, knowledgeBaseRelativePath),
        'template knowledge base\n',
      );
      await fs.writeFile(
        path.join(workingDirectoryPath, knowledgeBaseRelativePath),
        'existing knowledge base\n',
      );

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
              sourceType: 'localDevelopment',
              templateDirectoryPath,
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
        cliVersion: '0.1.0-test',
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        await fs.readFile(path.join(workingDirectoryPath, knowledgeBaseRelativePath), 'utf8'),
        'template knowledge base\n',
      );
      const projectMetadata = JSON.parse(
        await fs.readFile(path.join(workingDirectoryPath, '.apiease', 'project.json'), 'utf8'),
      );
      assert.deepEqual(Object.keys(projectMetadata.template.manifest), [
        'docs/knowledgebase/apiEaseDocsConsolidated.md',
      ]);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Next steps:',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should still skip non-knowledge-base conflicts while refreshing the bundled knowledge base file', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-mixed-conflicts-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];
      const knowledgeBaseRelativePath = path.join('docs', 'knowledgebase', 'apiEaseDocsConsolidated.md');

      await fs.mkdir(path.join(templateDirectoryPath, 'docs', 'knowledgebase'), { recursive: true });
      await fs.mkdir(path.join(workingDirectoryPath, 'docs', 'knowledgebase'), { recursive: true });
      await fs.writeFile(
        path.join(templateDirectoryPath, knowledgeBaseRelativePath),
        'template knowledge base\n',
      );
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');
      await fs.writeFile(
        path.join(workingDirectoryPath, knowledgeBaseRelativePath),
        'existing knowledge base\n',
      );
      await fs.writeFile(path.join(workingDirectoryPath, 'README.md'), 'custom readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
              sourceType: 'localDevelopment',
              templateDirectoryPath,
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
        cliVersion: '0.1.0-test',
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        await fs.readFile(path.join(workingDirectoryPath, knowledgeBaseRelativePath), 'utf8'),
        'template knowledge base\n',
      );
      assert.equal(await fs.readFile(path.join(workingDirectoryPath, 'README.md'), 'utf8'), 'custom readme\n');
      const projectMetadata = JSON.parse(
        await fs.readFile(path.join(workingDirectoryPath, '.apiease', 'project.json'), 'utf8'),
      );
      assert.deepEqual(Object.keys(projectMetadata.template.manifest), [
        'docs/knowledgebase/apiEaseDocsConsolidated.md',
      ]);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Skipped existing conflicting paths:',
          'README.md',
          '',
          'Next steps:',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should reuse identical existing template files and still write project metadata', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-identical-file-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];
      const gitignoreContent = '.DS_Store\nnode_modules/\n';

      await fs.mkdir(templateDirectoryPath, { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, '.gitignore'), gitignoreContent);
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');
      await fs.writeFile(path.join(workingDirectoryPath, '.gitignore'), gitignoreContent);

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
              sourceType: 'localDevelopment',
              templateDirectoryPath,
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
        cliVersion: '0.1.0-test',
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(await fs.readFile(path.join(workingDirectoryPath, '.gitignore'), 'utf8'), gitignoreContent);
      assert.equal(await fs.readFile(path.join(workingDirectoryPath, 'README.md'), 'utf8'), 'template readme\n');
      const projectMetadata = JSON.parse(
        await fs.readFile(path.join(workingDirectoryPath, '.apiease', 'project.json'), 'utf8'),
      );
      assert.equal(projectMetadata.cliVersion, '0.1.0-test');
      assert.equal(projectMetadata.template.displayTemplateSource, '../apiease-template');
      assert.deepEqual(Object.keys(projectMetadata.template.manifest).sort(), ['.gitignore', 'README.md']);
      for (const manifestHash of Object.values(projectMetadata.template.manifest)) {
        assert.equal(typeof manifestHash, 'string');
        assert.notEqual(manifestHash.length, 0);
      }
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Next steps:',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should omit git init from next steps when initializing an existing git directory', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-git-dir-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const destinationDirectoryPath = path.join(workingDirectoryPath, 'my-project');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(path.join(templateDirectoryPath, 'resources'), { recursive: true });
      await fs.mkdir(path.join(destinationDirectoryPath, '.git'), { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      const exitCode = await initProjectCommand.run(['init', 'my-project'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: my-project',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Next steps:',
          'cd my-project',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should default to the current directory when no project name is provided', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-current-directory-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(path.join(templateDirectoryPath, 'resources'), { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(await fs.readFile(path.join(workingDirectoryPath, 'README.md'), 'utf8'), 'template readme\n');
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Next steps:',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should omit the next steps section when initializing the current git directory', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-current-git-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(path.join(templateDirectoryPath, 'resources'), { recursive: true });
      await fs.mkdir(path.join(workingDirectoryPath, '.git'), { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
    });

    it('should exclude skipped conflicting files from the stored template manifest', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-customized-current-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(templateDirectoryPath, { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, 'README.md'), 'template readme\n');
      await fs.writeFile(path.join(workingDirectoryPath, 'README.md'), 'custom readme\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              publicRepositoryUrl: 'https://github.com/kevinstl-org/apiease-template',
              sourceType: 'localDevelopment',
              templateDirectoryPath,
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
        cliVersion: '0.1.0-test',
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(await fs.readFile(path.join(workingDirectoryPath, 'README.md'), 'utf8'), 'custom readme\n');
      const projectMetadata = JSON.parse(
        await fs.readFile(path.join(workingDirectoryPath, '.apiease', 'project.json'), 'utf8'),
      );
      assert.equal(projectMetadata.cliVersion, '0.1.0-test');
      assert.equal(projectMetadata.template.displayTemplateSource, '../apiease-template');
      assert.equal(projectMetadata.template.publicRepositoryUrl, 'https://github.com/kevinstl-org/apiease-template');
      assert.equal(projectMetadata.template.sourceType, 'localDevelopment');
      assert.deepEqual(projectMetadata.template.version, {
        type: 'gitCommit',
        value: 'template-sha-1',
      });
      assert.deepEqual(Object.keys(projectMetadata.template.manifest), []);
      assert.equal(
        stdoutChunks.join(''),
        [
          'Initializing APIEase project: .',
          'Using template: ../apiease-template',
          'Project initialized successfully.',
          '',
          'Skipped existing conflicting paths:',
          'README.md',
          '',
          'Next steps:',
          'git init',
          '',
        ].join('\n'),
      );
      assert.equal(stderrChunks.join(''), '');
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
