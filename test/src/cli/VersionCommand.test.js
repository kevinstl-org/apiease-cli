import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VersionCommand } from '../../../src/cli/VersionCommand.js';

describe('VersionCommand', () => {
  describe('run', () => {
    it('should write the configured cli version and return zero', async () => {
      // Arrange
      const stdoutChunks = [];
      const versionCommand = new VersionCommand({
        cliVersion: '1.2.3',
        stdout: createWritableStream(stdoutChunks),
      });

      // Act
      const exitCode = await versionCommand.run(['--version']);

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(stdoutChunks.join(''), '1.2.3\n');
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
