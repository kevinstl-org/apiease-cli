import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectDirectoryPath = path.resolve(currentDirectoryPath, '..', '..', '..');
const projectManagedPathResolverModuleUrl = pathToFileURL(
  path.join(projectDirectoryPath, 'src', 'project', 'ProjectManagedPathResolver.js'),
).href;

describe('ProjectManagedPathResolver', () => {
  describe('resolveManagedPath', () => {
    it('should resolve a managed path inside the provided root directory', async () => {
      // Arrange
      const { ProjectManagedPathResolver } = await import(projectManagedPathResolverModuleUrl);
      const projectManagedPathResolver = new ProjectManagedPathResolver();

      // Act
      const resolvedPath = projectManagedPathResolver.resolveManagedPath({
        managedPath: 'resources/requests/example-request.json',
        rootDirectoryPath: '/tmp/apiease-project',
      });

      // Assert
      assert.equal(
        resolvedPath,
        path.join('/tmp/apiease-project', 'resources', 'requests', 'example-request.json'),
      );
    });

    it('should reject a managed path that escapes the provided root directory', async () => {
      // Arrange
      const { ProjectManagedPathResolver } = await import(projectManagedPathResolverModuleUrl);
      const projectManagedPathResolver = new ProjectManagedPathResolver();

      // Act / Assert
      assert.throws(
        () => projectManagedPathResolver.resolveManagedPath({
          managedPath: '../../.zshrc',
          rootDirectoryPath: '/tmp/apiease-project',
        }),
        {
          code: 'APIEASE_INVALID_MANAGED_PATH',
          message: 'Managed template path must stay within the project root: ../../.zshrc',
        },
      );
    });

    it('should reject an absolute managed path', async () => {
      // Arrange
      const { ProjectManagedPathResolver } = await import(projectManagedPathResolverModuleUrl);
      const projectManagedPathResolver = new ProjectManagedPathResolver();

      // Act / Assert
      assert.throws(
        () => projectManagedPathResolver.resolveManagedPath({
          managedPath: '/tmp/evil.txt',
          rootDirectoryPath: '/tmp/apiease-project',
        }),
        {
          code: 'APIEASE_INVALID_MANAGED_PATH',
          message: 'Managed template path must stay within the project root: /tmp/evil.txt',
        },
      );
    });
  });
});
