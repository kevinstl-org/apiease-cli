# apiease

`apiease` is a Node-based CLI for bootstrapping APIEase projects and managing APIEase `request`, `widget`, `variable`, and `function` resources.

## Requirements

- Node.js 20 or newer

## Install

Install from npm:

```bash
npm install -g apiease
```

For local development from this repository:

```bash
npm install
```

To expose the command globally while working locally:

```bash
npm link
```

In both cases, the installed command is:

```bash
apiease
```

To confirm the installed CLI version:

```bash
apiease --version
```

## Commands

```bash
apiease --version
apiease init [project-name]
apiease upgrade
apiease upgrade [--check]
apiease upgrade --dry-run
apiease create <request|widget|variable|function> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease read request --request-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease read widget --widget-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease read variable --variable-name <name> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease read function --function-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease update request --request-id <id> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease update widget --widget-id <id> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease update variable --variable-name <name> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease update function --function-id <id> --file <path> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease delete request --request-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease delete widget --widget-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease delete variable --variable-name <name> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
apiease delete function --function-id <id> [--base-url <url>] [--shop-domain <shop-domain>] [--api-key <api-key>] [--json]
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

Current behavior:

- During local CLI development, the CLI resolves the template from `../apiease-template`.
- In installed usage, the CLI downloads the template from [kevinstl-org/apiease-template](https://github.com/kevinstl-org/apiease-template).
- The template is copied directly into `./my-project`.
- The CLI writes project metadata to `.apiease/project.json`.
- The metadata includes the template git version and a manifest of template-managed file hashes.
- Customer-owned template files are copied but excluded from the stored manifest: `CUSTOM_README.md` and `CUSTOM_AGENT_GUIDANCE.md`.
- The template-owned `README.md` is tracked in the manifest and can be refreshed by `apiease upgrade` like other managed template files.
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

- The command reads `.apiease/project.json` from the current project directory.
- During local CLI development, it compares the stored template git commit to the current `../apiease-template` git commit.
- In installed usage, it compares the stored template git commit to the latest commit fetched from [kevinstl-org/apiease-template](https://github.com/kevinstl-org/apiease-template).
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
- It ignores customer-owned template files: `CUSTOM_README.md` and `CUSTOM_AGENT_GUIDANCE.md`.
- It treats the template `README.md` as template-managed, so README updates can be added, updated, removed, or skipped as conflicts.
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

When `--api-key`, `--base-url`, or `--shop-domain` are omitted, `apiease` loads the active APIEase environment from your home directory and resolves the matching values from the selected env file.

Create the APIEase home directory:

```bash
mkdir -p ~/.apiease
```

Declare the active environment in `~/.apiease/environment`. The only supported values are `local`, `staging`, and `production`.

For a local setup:

```bash
printf 'local\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-local-api-key\nAPIEASE_BASE_URL=https://your-local-apiease-host.example.com\nAPIEASE_SHOP_DOMAIN=your-local-shop.myshopify.com\n' > ~/.apiease/.env.local
```

For a staging setup:

```bash
printf 'staging\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-staging-api-key\nAPIEASE_BASE_URL=https://your-staging-apiease-host.example.com\nAPIEASE_SHOP_DOMAIN=your-staging-shop.myshopify.com\n' > ~/.apiease/.env.staging
```

For a production setup:

```bash
printf 'production\n' > ~/.apiease/environment
printf 'APIEASE_API_KEY=your-production-api-key\nAPIEASE_BASE_URL=https://your-production-apiease-host.example.com\nAPIEASE_SHOP_DOMAIN=your-production-shop.myshopify.com\n' > ~/.apiease/.env.production
```

Configuration precedence is:

1. `--api-key`
2. `APIEASE_API_KEY` from `~/.apiease/.env.<environment>` selected by `~/.apiease/environment`

1. `--base-url`
2. `APIEASE_BASE_URL` from `~/.apiease/.env.<environment>` selected by `~/.apiease/environment`

1. `--shop-domain`
2. `APIEASE_SHOP_DOMAIN` from `~/.apiease/.env.<environment>` selected by `~/.apiease/environment`

If the home configuration is missing, invalid, or unreadable, the CLI fails fast with a structured error. The most common fixes are:

- Create `~/.apiease/environment` if it does not exist.
- Set `~/.apiease/environment` to exactly `local`, `staging`, or `production`.
- Create the matching `~/.apiease/.env.<environment>` file for the selected environment.
- Add a non-empty `APIEASE_API_KEY` entry to that env file.
- Add `APIEASE_BASE_URL` and `APIEASE_SHOP_DOMAIN` when you want those values to be optional on each CLI command.

## Manage Resources

CRUD commands require a resource name immediately after the verb. Supported resource names are `request`, `widget`, `variable`, and `function`.

Bare command shapes such as `apiease create` or `apiease read --request-id ...` are not supported.

Use `--request-id` for `request`, `--widget-id` for `widget`, `--variable-name` for `variable`, and `--function-id` for `function`.

If you are running from this repository without `npm link`, replace `apiease` with `./bin/apiease-cli` in the examples below.

Create a JSON file that contains the resource definition you want to send to APIEase. For example, a request definition file might look like this:

```json
{
  "name": "CLI demo request",
  "type": "http",
  "method": "GET",
  "address": "https://example.com/products"
}
```

Create resources:

```bash
apiease create request \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
apiease create widget \
  --file ./widget-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
apiease create variable \
  --file ./variable-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
apiease create function \
  --file ./function-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com
```

If your active `~/.apiease/.env.<environment>` file already defines `APIEASE_BASE_URL` and `APIEASE_SHOP_DOMAIN`, you can omit those flags:

```bash
apiease create request \
  --file ./request-definition.json
```

To override the home configuration for a single command, pass `--api-key` explicitly:

```bash
apiease create request \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com \
  --api-key your-apiease-api-key
```

Read resources:

```bash
apiease read request --request-id request-123
apiease read widget --widget-id widget-123
apiease read variable --variable-name sale_banner
apiease read function --function-id function-123
```

Update resources:

```bash
apiease update request --request-id request-123 --file ./request-definition.json
apiease update widget --widget-id widget-123 --file ./widget-definition.json
apiease update variable --variable-name sale_banner --file ./variable-definition.json
apiease update function --function-id function-123 --file ./function-definition.json
```

Delete resources:

```bash
apiease delete request --request-id request-123
apiease delete widget --widget-id widget-123
apiease delete variable --variable-name sale_banner
apiease delete function --function-id function-123
```

## JSON Output

Add `--json` when you want machine-readable output:

```bash
apiease create request \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com \
  --json
```

## Notes

- The public installed command name is `apiease`.
- `init` uses `../apiease-template` during local CLI development and otherwise downloads the template from [kevinstl-org/apiease-template](https://github.com/kevinstl-org/apiease-template).
- Resource definition files must be valid JSON with an object as the root value.
- `--api-key` is optional. When omitted, the CLI resolves `APIEASE_API_KEY` from `~/.apiease/.env.<environment>`.
- `--base-url` and `--shop-domain` are optional when `APIEASE_BASE_URL` and `APIEASE_SHOP_DOMAIN` are present in `~/.apiease/.env.<environment>`.
- Default output is human-readable. `--json` emits the raw structured result.
