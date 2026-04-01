import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const moduleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'scripts', 'knowledgebase', 'pullApiEaseDocsKnowledgeBase.js'),
).href;

describe('pullApiEaseDocsKnowledgeBase', () => {
  describe('runPullApiEaseDocsKnowledgeBase', () => {
    it('should pull the knowledge base and report the target path', async () => {
      // Arrange
      const { runPullApiEaseDocsKnowledgeBase } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const pullArguments = [];
      class FakeApiEaseDocsKnowledgeBasePullService {
        async pullApiEaseDocsKnowledgeBase(argumentsObject) {
          pullArguments.push(argumentsObject);
          return {
            targetPath: '/tmp/apiease-cli/docs/knowledgebase/apiEaseDocsConsolidated.md',
          };
        }
      }

      // Act
      const exitCode = await runPullApiEaseDocsKnowledgeBase({
        argv: [],
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEaseDocsKnowledgeBasePullService: new FakeApiEaseDocsKnowledgeBasePullService(),
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(stderrChunks.length, 0);
      assert.deepEqual(pullArguments, [{ check: false }]);
      assert.match(stdoutChunks.join(''), /Pulled knowledge base to: \/tmp\/apiease-cli\/docs\/knowledgebase\/apiEaseDocsConsolidated.md/);
    });

    it('should return one and write the pull failure message when the service throws', async () => {
      // Arrange
      const { runPullApiEaseDocsKnowledgeBase } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      class FakeApiEaseDocsKnowledgeBasePullService {
        async pullApiEaseDocsKnowledgeBase() {
          throw new Error('Missing knowledge base source');
        }
      }

      // Act
      const exitCode = await runPullApiEaseDocsKnowledgeBase({
        argv: ['--check'],
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEaseDocsKnowledgeBasePullService: new FakeApiEaseDocsKnowledgeBasePullService(),
      });

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.length, 0);
      assert.match(stderrChunks.join(''), /Missing knowledge base source/);
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
