import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..');
const entrypointModuleUrl = pathToFileURL(path.join(projectDirectoryPath, 'bin', 'apiease-cli.js')).href;

describe('apiease-cli', () => {
  describe('runCli', () => {
    it('should delegate command arguments to CreateRequestCommand and return its exit code', async () => {
      // Arrange
      const { runCli } = await import(entrypointModuleUrl);
      const commandArguments = ['create', '--file', '/tmp/request.json'];
      const receivedCommandArguments = [];
      const createRequestCommand = {
        async run(incomingCommandArguments) {
          receivedCommandArguments.push(incomingCommandArguments);
          return 0;
        },
      };

      // Act
      const exitCode = await runCli({
        commandArguments,
        createRequestCommand,
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(receivedCommandArguments, [commandArguments]);
    });

    it('should delegate init command arguments to InitProjectCommand and return its exit code', async () => {
      // Arrange
      const { runCli } = await import(entrypointModuleUrl);
      const commandArguments = ['init', 'my-project'];
      const receivedCommandArguments = [];
      const initProjectCommand = {
        async run(incomingCommandArguments) {
          receivedCommandArguments.push(incomingCommandArguments);
          return 0;
        },
      };
      const createRequestCommand = {
        async run() {
          throw new Error('create command should not run');
        },
      };

      // Act
      const exitCode = await runCli({
        commandArguments,
        createRequestCommand,
        initProjectCommand,
        stdout: createWritableStream([]),
        stderr: createWritableStream([]),
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.deepEqual(receivedCommandArguments, [commandArguments]);
    });

    it('should return one and write a structured json failure when an unexpected runtime error is thrown', async () => {
      // Arrange
      const { runCli } = await import(entrypointModuleUrl);
      const stderrChunks = [];
      const createRequestCommand = {
        async run() {
          throw new Error('Unexpected boom');
        },
      };

      // Act
      const exitCode = await runCli({
        commandArguments: ['create', '--json'],
        createRequestCommand,
        stdout: createWritableStream([]),
        stderr: createWritableStream(stderrChunks),
      });

      // Assert
      assert.equal(exitCode, 1);
      assert.deepEqual(JSON.parse(stderrChunks.join('')), {
        status: 500,
        ok: false,
        errorCode: 'UNEXPECTED_CLI_ERROR',
        message: 'Unexpected boom',
        fieldErrors: [],
      });
    });
  });

  describe('entrypoint file', () => {
    it('should declare the node shebang so the script is directly executable', async () => {
      // Arrange
      const entrypointFilePath = path.join(projectDirectoryPath, 'bin', 'apiease-cli.js');

      // Act
      const entrypointFileContent = await fs.readFile(entrypointFilePath, 'utf8');

      // Assert
      assert.equal(entrypointFileContent.startsWith('#!/usr/bin/env node\n'), true);
    });

    it('should preserve the executable file mode for direct invocation', async () => {
      // Arrange
      const entrypointFilePath = path.join(projectDirectoryPath, 'bin', 'apiease-cli.js');

      // Act
      const entrypointFileStats = await fs.stat(entrypointFilePath);

      // Assert
      assert.notEqual(entrypointFileStats.mode & 0o100, 0);
    });
  });

  describe('bash wrapper', () => {
    it('should resolve the project bin directory when invoked through a symlink and forward arguments unchanged', async () => {
      // Arrange
      const wrapperFilePath = path.join(projectDirectoryPath, 'bin', 'apiease-cli');
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-cli-wrapper-'));
      const symlinkDirectoryPath = path.join(temporaryDirectoryPath, 'bin');
      const fakeNodeDirectoryPath = path.join(temporaryDirectoryPath, 'fake-node-bin');
      const captureFilePath = path.join(temporaryDirectoryPath, 'captured.json');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'working-directory');

      await fs.mkdir(symlinkDirectoryPath, { recursive: true });
      await fs.mkdir(fakeNodeDirectoryPath, { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.symlink(wrapperFilePath, path.join(symlinkDirectoryPath, 'apiease-cli'));
      await fs.writeFile(
        path.join(fakeNodeDirectoryPath, 'node'),
        [
          '#!/usr/bin/env bash',
          'set -euo pipefail',
          'capture_file_path="$CAPTURE_FILE_PATH"',
          'printf \'{"entrypointPath":"%s","forwardedArguments":["%s","%s","%s"],"workingDirectoryPath":"%s"}\' "$1" "$2" "$3" "$4" "$PWD" > "$capture_file_path"',
          'exit 0',
          '',
        ].join('\n'),
        { mode: 0o755 },
      );

      const resolvedWorkingDirectoryPath = await fs.realpath(workingDirectoryPath);

      // Act
      const wrapperExitCode = await runShellScript({
        command: path.join(symlinkDirectoryPath, 'apiease-cli'),
        commandArguments: ['create', '--file', '/tmp/request.json'],
        currentWorkingDirectoryPath: workingDirectoryPath,
        environmentVariables: {
          ...process.env,
          PATH: `${fakeNodeDirectoryPath}:${process.env.PATH}`,
          CAPTURE_FILE_PATH: captureFilePath,
        },
      });
      const capturedInvocation = JSON.parse(await fs.readFile(captureFilePath, 'utf8'));

      // Assert
      assert.equal(wrapperExitCode, 0);
      assert.deepEqual(capturedInvocation, {
        entrypointPath: path.join(projectDirectoryPath, 'bin', 'apiease-cli.js'),
        forwardedArguments: ['create', '--file', '/tmp/request.json'],
        workingDirectoryPath: resolvedWorkingDirectoryPath,
      });
    });

    it('should exit with the same status code returned by the node entrypoint process', async () => {
      // Arrange
      const wrapperFilePath = path.join(projectDirectoryPath, 'bin', 'apiease-cli');
      const temporaryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-cli-wrapper-exit-code-'));
      const fakeNodeDirectoryPath = path.join(temporaryDirectoryPath, 'fake-node-bin');
      const workingDirectoryPath = path.join(temporaryDirectoryPath, 'working-directory');

      await fs.mkdir(fakeNodeDirectoryPath, { recursive: true });
      await fs.mkdir(workingDirectoryPath, { recursive: true });
      await fs.writeFile(
        path.join(fakeNodeDirectoryPath, 'node'),
        ['#!/usr/bin/env bash', 'exit 17', ''].join('\n'),
        { mode: 0o755 },
      );

      // Act
      const wrapperExitCode = await runShellScript({
        command: wrapperFilePath,
        commandArguments: ['create'],
        currentWorkingDirectoryPath: workingDirectoryPath,
        environmentVariables: {
          ...process.env,
          PATH: `${fakeNodeDirectoryPath}:${process.env.PATH}`,
        },
      });

      // Assert
      assert.equal(wrapperExitCode, 17);
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

async function runShellScript({
  command,
  commandArguments,
  currentWorkingDirectoryPath,
  environmentVariables,
}) {
  return await new Promise((resolve, reject) => {
    const childProcess = spawn(command, commandArguments, {
      cwd: currentWorkingDirectoryPath,
      env: environmentVariables,
      stdio: 'ignore',
    });

    childProcess.on('error', reject);
    childProcess.on('close', (exitCode) => {
      resolve(exitCode);
    });
  });
}
