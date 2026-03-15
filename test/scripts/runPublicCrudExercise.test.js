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
      const apiEaseHomeConfigurationResolver = {
        async resolveEnvironmentVariables() {
          throw new Error('Home configuration should not be read');
        },
      };
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
          APIEASE_BASE_URL: 'https://apiease.example.com/root',
          APIEASE_API_KEY: 'api-key-1',
          APIEASE_SHOP_DOMAIN: 'cool-shop.myshopify.com',
        },
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEasePublicCrudExerciseClass: FakeApiEasePublicCrudExercise,
        apiEaseHomeConfigurationResolver,
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

    it('should load missing values from the apiease home env files', async () => {
      // Arrange
      const { runPublicCrudExercise } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const constructorArguments = [];
      const apiEaseHomeConfigurationResolver = {
        async resolveEnvironmentVariables() {
          return {
            ok: true,
            environmentVariables: {
              APIEASE_BASE_URL: 'https://apiease.example.com/root',
              APIEASE_API_KEY: 'api-key-1',
              APIEASE_SHOP_DOMAIN: 'cool-shop.myshopify.com',
            },
          };
        },
      };
      class FakeApiEasePublicCrudExercise {
        constructor(argumentsObject) {
          constructorArguments.push(argumentsObject);
        }

        async run() {
          return {
            exerciseId: 'exercise-123',
            cleanupResults: [],
          };
        }
      }

      // Act
      const exitCode = await runPublicCrudExercise({
        environmentVariables: {},
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEasePublicCrudExerciseClass: FakeApiEasePublicCrudExercise,
        apiEaseHomeConfigurationResolver,
      });

      // Assert
      assert.equal(exitCode, 0);
      assert.equal(stderrChunks.length, 0);
      assert.equal(constructorArguments.length, 1);
      assert.equal(constructorArguments[0].apiBaseUrl, 'https://apiease.example.com/root');
      assert.equal(constructorArguments[0].apiKey, 'api-key-1');
      assert.equal(constructorArguments[0].shopDomain, 'cool-shop.myshopify.com');
    });

    it('should fail when environment variables and apiease home config together still miss required values', async () => {
      // Arrange
      const { runPublicCrudExercise } = await import(moduleUrl);
      const stdoutChunks = [];
      const stderrChunks = [];
      const apiEaseHomeConfigurationResolver = {
        async resolveEnvironmentVariables() {
          return {
            ok: true,
            environmentVariables: {
              APIEASE_API_KEY: 'api-key-1',
            },
          };
        },
      };

      // Act
      const exitCode = await runPublicCrudExercise({
        environmentVariables: {},
        stdout: createWritableStream(stdoutChunks),
        stderr: createWritableStream(stderrChunks),
        apiEaseHomeConfigurationResolver,
      });

      // Assert
      assert.equal(exitCode, 1);
      assert.equal(stdoutChunks.length, 0);
      assert.match(
        stderrChunks.join(''),
        /Missing required environment variables: APIEASE_BASE_URL, APIEASE_SHOP_DOMAIN/,
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
