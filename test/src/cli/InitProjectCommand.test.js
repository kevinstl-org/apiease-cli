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
    it('should copy the template into the target project directory while excluding .git and node_modules', async () => {
      // Arrange
      const { InitProjectCommand } = await import(initProjectCommandModuleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-init-command-'));
      const templateDirectoryPath = path.join(temporaryDirectoryPath, 'apiease-template');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'workspace');
      const stdoutChunks = [];
      const stderrChunks = [];

      await fs.mkdir(path.join(templateDirectoryPath, '.git'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, 'node_modules', 'left-pad'), { recursive: true });
      await fs.mkdir(path.join(templateDirectoryPath, 'src'), { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(path.join(templateDirectoryPath, '.git', 'config'), '[core]\nrepositoryformatversion = 0\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'node_modules', 'left-pad', 'index.js'), 'export default 1;\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'package.json'), '{\n  "name": "apiease-template"\n}\n');
      await fs.writeFile(path.join(templateDirectoryPath, '.env'), 'APIEASE=1\n');
      await fs.writeFile(path.join(templateDirectoryPath, 'src', 'index.js'), 'export const app = true;\n');

      const initProjectCommand = new InitProjectCommand({
        templateProjectSourceResolver: {
          resolveTemplateSource() {
            return {
              displayTemplateSource: '../apiease-template',
              templateDirectoryPath,
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
      await assert.rejects(fs.access(path.join(workingDirectoryPath, 'my-project', '.git')));
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

    it('should fail when the destination directory already exists and is not empty', async () => {
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
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Act
      const exitCode = await initProjectCommand.run(['init', 'my-project'], {
        currentWorkingDirectoryPath: workingDirectoryPath,
      });

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.join(''), '');
      assert.equal(
        stderrChunks.join(''),
        `Destination directory already exists and is not empty: ${destinationDirectoryPath}\n`,
      );
      await assert.rejects(fs.access(path.join(destinationDirectoryPath, 'package.json')));
      assert.equal(await fs.readFile(path.join(destinationDirectoryPath, 'existing.txt'), 'utf8'), 'keep me\n');
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
