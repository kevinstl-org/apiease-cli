import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const moduleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'knowledgebase', 'ApiEaseDocsKnowledgeBasePullService.js'),
).href;

describe('ApiEaseDocsKnowledgeBasePullService', () => {
  describe('pullApiEaseDocsKnowledgeBase', () => {
    it('should default the target path to the project docs knowledgebase directory', async () => {
      // Arrange
      const { ApiEaseDocsKnowledgeBasePullService } = await import(moduleUrl);
      const apiEaseDocsKnowledgeBasePullService = new ApiEaseDocsKnowledgeBasePullService();

      // Assert
      assert.equal(
        apiEaseDocsKnowledgeBasePullService.targetPath,
        path.join(projectDirectoryPath, 'docs', 'knowledgebase', 'apiEaseDocsConsolidated.md'),
      );
    });

    it('should copy the consolidated knowledge base into the target path', async () => {
      // Arrange
      const { ApiEaseDocsKnowledgeBasePullService } = await import(moduleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(
        path.join(os.tmpdir(), 'apiease-cli-knowledgebase-pull-'),
      );
      const sourcePath = path.join(temporaryDirectoryPath, 'source', 'apiEaseDocsConsolidated.md');
      const targetPath = path.join(
        temporaryDirectoryPath,
        'docs',
        'knowledgebase',
        'apiEaseDocsConsolidated.md',
      );

      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(sourcePath, '# APIEase Docs\n');

      const apiEaseDocsKnowledgeBasePullService = new ApiEaseDocsKnowledgeBasePullService({
        sourcePath,
        targetPath,
      });

      // Act
      const result = await apiEaseDocsKnowledgeBasePullService.pullApiEaseDocsKnowledgeBase();

      // Assert
      assert.deepEqual(result, {
        sourcePath,
        targetPath,
      });
      assert.equal(await fs.readFile(targetPath, 'utf8'), '# APIEase Docs\n');
    });

    it('should fall back to the alternate docs repository knowledgebase path when needed', async () => {
      // Arrange
      const { ApiEaseDocsKnowledgeBasePullService } = await import(moduleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(
        path.join(os.tmpdir(), 'apiease-cli-knowledgebase-fallback-'),
      );
      const sourcePathCandidates = [
        path.join(temporaryDirectoryPath, 'docs', 'apiEaseDocsConsolidated.md'),
        path.join(temporaryDirectoryPath, 'knowledgebase', 'apiEaseDocsConsolidated.md'),
      ];
      const targetPath = path.join(
        temporaryDirectoryPath,
        'docs',
        'knowledgebase',
        'apiEaseDocsConsolidated.md',
      );

      await fs.mkdir(path.dirname(sourcePathCandidates[1]), { recursive: true });
      await fs.writeFile(sourcePathCandidates[1], '# Alternate APIEase Docs\n');

      const apiEaseDocsKnowledgeBasePullService = new ApiEaseDocsKnowledgeBasePullService({
        sourcePathCandidates,
        targetPath,
      });

      // Act
      const result = await apiEaseDocsKnowledgeBasePullService.pullApiEaseDocsKnowledgeBase();

      // Assert
      assert.deepEqual(result, {
        sourcePath: sourcePathCandidates[1],
        targetPath,
      });
      assert.equal(await fs.readFile(targetPath, 'utf8'), '# Alternate APIEase Docs\n');
    });

    it('should throw when check mode finds an out-of-date target file', async () => {
      // Arrange
      const { ApiEaseDocsKnowledgeBasePullService } = await import(moduleUrl);
      const temporaryDirectoryPath = await fs.mkdtemp(
        path.join(os.tmpdir(), 'apiease-cli-knowledgebase-check-'),
      );
      const sourcePath = path.join(temporaryDirectoryPath, 'source', 'apiEaseDocsConsolidated.md');
      const targetPath = path.join(
        temporaryDirectoryPath,
        'docs',
        'knowledgebase',
        'apiEaseDocsConsolidated.md',
      );

      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(sourcePath, '# APIEase Docs\n');
      await fs.writeFile(targetPath, '# Older Docs\n');

      const apiEaseDocsKnowledgeBasePullService = new ApiEaseDocsKnowledgeBasePullService({
        sourcePath,
        targetPath,
      });

      // Act
      await assert.rejects(
        async () => {
          await apiEaseDocsKnowledgeBasePullService.pullApiEaseDocsKnowledgeBase({ check: true });
        },
        /Knowledge base target is out of date: .*apiEaseDocsConsolidated\.md/,
      );
    });
  });
});
