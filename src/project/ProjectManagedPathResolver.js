import path from 'node:path';

class ProjectManagedPathResolver {
  resolveManagedPath({ managedPath, rootDirectoryPath }) {
    const resolvedRootDirectoryPath = path.resolve(rootDirectoryPath);
    const resolvedManagedPath = path.resolve(resolvedRootDirectoryPath, managedPath || '');
    const relativeManagedPath = path.relative(resolvedRootDirectoryPath, resolvedManagedPath);

    if (!this.isManagedPathWithinRoot({ managedPath, relativeManagedPath })) {
      throw this.buildInvalidManagedPathError(managedPath);
    }

    return resolvedManagedPath;
  }

  isManagedPathWithinRoot({ managedPath, relativeManagedPath }) {
    if (typeof managedPath !== 'string' || managedPath.length === 0) {
      return false;
    }

    if (path.isAbsolute(managedPath)) {
      return false;
    }

    if (relativeManagedPath.length === 0 || relativeManagedPath === '.') {
      return false;
    }

    return !relativeManagedPath.startsWith(`..${path.sep}`) && relativeManagedPath !== '..';
  }

  buildInvalidManagedPathError(managedPath) {
    const error = new Error(
      `Managed template path must stay within the project root: ${managedPath}`,
    );
    error.code = 'APIEASE_INVALID_MANAGED_PATH';
    return error;
  }
}

export { ProjectManagedPathResolver };
