import fs from 'node:fs/promises';
import path from 'node:path';

class TemplateProjectVersionResolver {
  async resolveTemplateVersion(templateDirectoryPath) {
    const gitDirectoryPath = path.join(templateDirectoryPath, '.git');
    const headReference = (await fs.readFile(path.join(gitDirectoryPath, 'HEAD'), 'utf8')).trim();

    return {
      type: 'gitCommit',
      value: headReference.startsWith('ref: ')
        ? await this.resolveReferencedCommit(gitDirectoryPath, headReference.slice(5))
        : headReference,
    };
  }

  async resolveReferencedCommit(gitDirectoryPath, headReference) {
    const referenceFilePath = path.join(gitDirectoryPath, headReference);

    try {
      return (await fs.readFile(referenceFilePath, 'utf8')).trim();
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }

    return await this.resolvePackedReferenceCommit(gitDirectoryPath, headReference);
  }

  async resolvePackedReferenceCommit(gitDirectoryPath, headReference) {
    const packedReferences = await fs.readFile(path.join(gitDirectoryPath, 'packed-refs'), 'utf8');

    for (const packedReferenceLine of packedReferences.split('\n')) {
      if (packedReferenceLine.startsWith('#') || packedReferenceLine.startsWith('^') || packedReferenceLine === '') {
        continue;
      }

      const [commitHash, packedReference] = packedReferenceLine.split(' ');
      if (packedReference === headReference) {
        return commitHash;
      }
    }

    throw new Error(`Unable to resolve template git reference "${headReference}".`);
  }
}

export { TemplateProjectVersionResolver };
