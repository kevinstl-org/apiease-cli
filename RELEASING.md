# Maintainer Release Process

This document is for maintainers publishing packages from this repository.

## Package Layout

This repository publishes one npm package from the repository root: `apiease`.

## Release the CLI

1. Confirm you are logged in to the correct npm account:

```bash
npm whoami
```

2. Update the root package version in `package.json`.

3. Run the full test suite from the repository root:

```bash
./.codex/run_test_suite.sh
```

4. Optionally inspect the package contents before publishing:

```bash
npm pack --dry-run
```

5. Publish the CLI package from the repository root:

```bash
npm publish
```

6. Verify the published version:

```bash
npm view apiease version
```

7. Optionally verify the installed command:

```bash
npm install -g apiease
apiease --help
```

## Notes

- The published npm package name is `apiease`.
- The installed public command exposed by that package is `apiease`.
