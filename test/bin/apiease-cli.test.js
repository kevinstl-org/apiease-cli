import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
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
});

function createWritableStream(chunks) {
  return {
    write(chunk) {
      chunks.push(chunk);
    },
  };
}
