import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..');
const moduleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'scripts', 'runPublicCrudExercise.js'),
).href;

describe('runPublicCrudExercise', () => {
  describe('runPublicCrudExercise', () => {
    it('should build the live-api exercise from environment variables and report success', async () => {
      // Arrange
      const { runPublicCrudExercise } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const constructorArguments = [];
      class FakeApiEasePublicCrudExercise {
        constructor(argumentsObject) {
          constructorArguments.push(argumentsObject);
        }

        async run() {
          return {
            exerciseId: 'exercise-123',
            cleanupResults: [
              { resourceType: 'shopVariable', isSuccess: true },
              { resourceType: 'widget', isSuccess: true },
              { resourceType: 'request', isSuccess: true },
            ],
          };
        }
      }

      // Act
      const exitCode = await runPublicCrudExercise({
        environmentVariables: {
          APIEASE_API_BASE_URL: 'https://apiease.example.com/root',
          APIEASE_API_KEY: 'api-key-1',
          APIEASE_SHOP_DOMAIN: 'cool-shop.myshopify.com',
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEasePublicCrudExerciseClass: FakeApiEasePublicCrudExercise,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(stderrChunks.length, 0);
      assert.equal(constructorArguments.length, 1);
      assert.equal(constructorArguments[0].apiBaseUrl, 'https://apiease.example.com/root');
      assert.equal(constructorArguments[0].apiKey, 'api-key-1');
      assert.equal(constructorArguments[0].shopDomain, 'cool-shop.myshopify.com');
      assert.match(stdoutChunks.join(''), /Public CRUD exercise completed successfully/);
      assert.match(stdoutChunks.join(''), /exercise-123/);
    });

    it('should fail fast when required environment variables are missing', async () => {
      // Arrange
      const { runPublicCrudExercise } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];

      // Act
      const exitCode = await runPublicCrudExercise({
        environmentVariables: {
          APIEASE_API_BASE_URL: 'https://apiease.example.com/root',
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
      });

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.length, 0);
      assert.match(
        stderrChunks.join(''),
        /Missing required environment variables: APIEASE_API_KEY, APIEASE_SHOP_DOMAIN/,
      );
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
