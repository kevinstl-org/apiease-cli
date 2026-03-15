# apiease-cli

`apiease-cli` is a Node-based CLI for bootstrapping APIEase projects and creating APIEase requests.

## Requirements

- Node.js 20 or newer

## Install

From this repository:

```bash
npm install
```

To expose the command globally while working locally:

```bash
npm link
```

After linking, the installed command is:

```bash
apiease
```

## Commands

```bash
apiease init [project-name]
apiease upgrade
apiease upgrade [--check]
apiease upgrade --dry-run
apiease create --file <path> --base-url <url> --shop-domain <shop-domain> [--api-key <api-key>] [--json]
```

## Initialize a Project

Create a new project from the local template repository:

```bash
apiease init my-project
```

Initialize the current directory, for example after cloning an empty GitHub repository:

```bash
git clone <your-empty-repo-url>
cd <your-repo-directory>
apiease init .
```

If you are already in the target directory, `apiease init` defaults to the same behavior as `apiease init .`.

Current development behavior:

- The CLI resolves the template from `../apiease-template`.
- The template is copied directly into `./my-project`.
- The CLI writes project metadata to `.apiease/project.json`.
- The metadata includes the template git version and a manifest of template-managed file hashes.
- Customer-owned template files are copied but excluded from the stored manifest: `README.md`, `CUSTOM_README.md`, and `CUSTOM_AGENT_GUIDANCE.md`.
- The template `.git` and `.idea` directories are excluded.
- `node_modules` is excluded if it exists in the template.
- Existing files and folders are allowed when they do not collide with template paths.
- Existing template files with identical content are reused instead of treated as collisions.
- Existing conflicting files are preserved, skipped, and reported after init completes.
- Skipped conflicting files are not added to the stored template manifest, so future `upgrade --dry-run` output continues to show them as conflicts until you resolve them.

Expected output:

```text
Creating APIEase project: my-project
Using template: ../apiease-template
Project created successfully.

Next steps:
cd my-project
git init
```

For existing directories:

- The CLI reports `Initializing APIEase project: ...` instead of `Creating APIEase project: ...`.
- The CLI reports `Project initialized successfully.` instead of `Project created successfully.`
- The CLI reports skipped existing conflicting paths instead of overwriting them.
- The CLI omits `git init` when the destination already contains a `.git` directory.
- The CLI omits the entire `Next steps:` section when there are no remaining next steps to show.

## Check for Template Upgrades

Check whether the current project template metadata matches the latest local template version:

```bash
apiease upgrade --check
```

Current behavior:

- The command reads `.apiease/project.json` from the current project directory.
- It compares the stored template git commit to the current `../apiease-template` git commit.
- It exits `0` when the project is already up to date.
- It exits `1` when an upgrade is available or when the project metadata is missing.

Example up-to-date output:

```text
APIEASE project template is up to date.
```

Example upgrade-available output:

```text
APIEASE project template upgrade is available.
Current project template version: <stored-template-commit>
Latest template version: <current-template-commit>
```

Preview the file-level upgrade plan without writing any changes:

```bash
apiease upgrade --dry-run
```

Current dry-run behavior:

- It compares the stored template manifest from `.apiease/project.json` to the current template manifest.
- It classifies template-managed file changes as `Add`, `Update`, `Remove`, or `Skip conflict`.
- It ignores customer-owned template files: `README.md`, `CUSTOM_README.md`, and `CUSTOM_AGENT_GUIDANCE.md`.
- It never writes project files.
- It exits `1` when there are planned changes or conflicts to review.

Apply safe template-managed upgrades:

```bash
apiease upgrade
```

Current apply behavior:

- It adds missing template-managed files.
- It updates template-managed files that still match their previously stored template baseline.
- It removes deleted template-managed files only when the project copy still matches the stored baseline.
- It skips conflicting template-managed files instead of overwriting them.
- It ignores user-added files that are not part of the stored template manifest unless they collide with a newly added template-managed path.
- It updates `.apiease/project.json` after applying safe changes.
- It exits `1` when any managed conflicts remain after applying the safe changes.

## Configure Authentication

When `--api-key` is omitted, `apiease` loads the active APIEase environment from your home directory and resolves `APIEASE_API_KEY` from the matching env file.

Create the APIEase home directory:

```bash
mkdir -p ~/.apiease
```

Declare the active environment in `~/.apiease/environment`. The only supported values are `local`, `staging`, and `production`.

For a local setup:

```bash
printf 'local\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-local-api-key\n' > ~/.apiease/.env.local
```

For a staging setup:

```bash
printf 'staging\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-staging-api-key\n' > ~/.apiease/.env.staging
```

For a production setup:

```bash
printf 'production\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-production-api-key\n' > ~/.apiease/.env.production
```

Authentication precedence is:

1. `--api-key`
2. `APIEASE_API_KEY` from `~/.apiease/.env.<environment>` selected by `~/.apiease/environment`

If the home configuration is missing, invalid, or unreadable, the CLI fails fast with a structured error. The most common fixes are:

- Create `~/.apiease/environment` if it does not exist.
- Set `~/.apiease/environment` to exactly `local`, `staging`, or `production`.
- Create the matching `~/.apiease/.env.<environment>` file for the selected environment.
- Add a non-empty `APIEASE_API_KEY` entry to that env file.

## Create a Request

Create a JSON file that contains the request definition you want to send to APIEase. For example:

```json
{
  "name": "CLI demo request",
  "type": "http",
  "method": "GET",
  "address": "https://example.com/products"
}
```

Run the CLI from the repository root:

```bash
./bin/apiease-cli create \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
```

If you used `npm link` or installed the package, the command is:

```bash
apiease create \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
```

To override the home configuration for a single command, pass `--api-key` explicitly:

```bash
apiease create \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com \
  --api-key your-apiease-api-key
```

## JSON Output

Add `--json` when you want machine-readable output:

```bash
./bin/apiease-cli create \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com \
  --json
```

## Notes

- The public installed command name is `apiease`.
- `init` currently copies the local development template from `../apiease-template`.
- The request definition file must be valid JSON with an object as the root value.
- `--api-key` is optional. When omitted, the CLI resolves `APIEASE_API_KEY` from `~/.apiease/.env.<environment>`.
- Default output is human-readable. `--json` emits the raw structured result.
