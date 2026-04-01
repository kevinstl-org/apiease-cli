# Maintainer Release Process

This document is for maintainers publishing packages from this repository.

## Package Layout

This repository contains two npm packages:

- The repository root publishes the real CLI package: `apiease-cli`
- `reserve/apiease` publishes the reserved placeholder package: `apiease`

Normal CLI releases should publish only the root package.

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
npm view apiease-cli version
```

7. Optionally verify the installed command:

```bash
npm install -g apiease-cli
apiease --help
```

## Publish the Reserved Placeholder Package

Only do this when you intentionally need to publish or update the reserved `apiease` placeholder package.

```bash
cd reserve/apiease
npm publish
```

## Notes

- The published npm package name for the real CLI is `apiease-cli`.
- The installed public command exposed by that package is `apiease`.
- The `reserve/apiease` package does not expose a CLI command.
