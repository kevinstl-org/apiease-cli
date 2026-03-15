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
- The template `.git` and `.idea` directories are excluded.
- `node_modules` is excluded if it exists in the template.
- Existing files and folders are allowed when they do not collide with template paths.
- The command fails if a template file or folder would overwrite an existing path.

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
- The CLI omits `git init` when the destination already contains a `.git` directory.
- The CLI omits the entire `Next steps:` section when there are no remaining next steps to show.

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
