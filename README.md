# apiease-cli

`apiease-cli` is a Node-based client and thin command-line wrapper for creating APIEase requests through the APIEase programmatic request API.

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

## Create a Request

Create a JSON file that contains the request definition you want to send to APIEase. For example:

```json
{
  "name": "CLI demo request",
  "requestType": "http",
  "method": "GET",
  "url": "https://example.com/products"
}
```

Run the CLI from the repository root:

```bash
./bin/apiease-cli create \
  --file ./request-definition.json \
  --base-url https://your-apiease-host.example.com \
  --shop-domain your-shop.myshopify.com \
  --api-key your-apiease-api-key
```

If you used `npm link` or installed the package, the command is:

```bash
apiease-cli create \
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
  --api-key your-apiease-api-key \
  --json
```

## Command Shape

```bash
apiease-cli create --file <path> --base-url <url> --shop-domain <shop-domain> --api-key <api-key> [--json]
```

## Notes

- Only the `create` command is in scope.
- The request definition file must be valid JSON with an object as the root value.
- Default output is human-readable. `--json` emits the raw structured result.
