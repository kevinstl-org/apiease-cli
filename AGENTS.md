# Repository Guidelines

> Note: If a `.codex/AGENTS.md` file exists in this project, Codex must use it in addition to this root `AGENTS.md`. This file defines project-wide coding standards, architecture, and naming conventions. `.codex/AGENTS.md` defines Codex workflow behavior (TDD rules, task scoping, and automation flow). Both files apply, with this root file taking precedence for coding standards.
> Always reread this file before writing code or tests.

## Project Structure & Module Organization
- `app/` holds the Remix UI: `routes/` for screens, `routes/api` for api endpoints, `components/` for Polaris UI, and `entry.*` for bootstrapping.
- `backend/` contains the operational services (Shopify clients, DAO layer, cron/flow engines, AI helpers). Treat it as the domain layer even when consumed from Remix loaders.
- `extensions/` stores Shopify Flow extension manifests; update them through `scripts/extensions/update-extensions.sh`.
- `charts/`, `preview/`, and `Dockerfile*` drive runtime packaging. `demo/` hosts static HTML samples. Tests live in `test/` mirroring the main tree.
-  shopify.server.js instantiates all backend services for Remix loaders/actions; avoid direct imports from `backend/` into `app/` to preserve separation of concerns.
-  When a route needs access to backend services call the service from the shopify object by importing it from `shopify.server.js`.
-  Treat `shopify.server.js` as the composition root: instantiate concrete classes there and inject them through constructors. Do not instantiate constructor collaborators inside other service constructors.
-  vite.config.js defines the exposed routes for `app/routes/api` endpoints. You must add new api endpoints there so they are accessible.
-  `app/service/` is reserved for UI-only services (for example JSX/component construction helpers, view-model shaping, and thin UI-only logic). Do not place backend business logic or external-service integration code in `app/service/`.
-  `backend/service/` is for backend business logic and all external integrations (Shopify APIs, databases, queues, third-party APIs, and other network/service interfaces).
-  Always include hidden files when searching (e.g., use `rg --files -uu`).

## Mandatory Development Protocol (Hard Rule)

- For any behavior change (new feature, bugfix, regression fix, or access-control change), the following is mandatory:
  1. Run `npm run test` before any file edits.
  2. If tests fail, remediate those failures before any behavior-specific implementation.
  3. Add or update tests for the new behavior and include at least one positive and one negative case.
  4. Run the targeted test(s) and confirm they fail (`red`).
  5. Implement only the minimal source changes required.
  6. Re-run the same targeted test(s) until they pass (`green`).
  7. Repeat 3→6 for each additional behavior change if needed.
  8. Run `npm run test` again only after the behavior updates pass at least one full cycle of red->green.
- You must not implement source changes without a currently failing targeted test proving the behavior gap.
- You must not skip full suite runs; one before changes and one at the end of the change set.
- If any step cannot be completed (missing command, flaky suite, blocked environment), or if you do not have clear remediation guidance for a failing test, ask for user direction before making edits.

## Build, Test, and Development Commands
- `npm run dev`: starts Shopify CLI tunneling plus the Remix dev server. Press `p` in the CLI output to open the embedded app.
- `npm run build`: Vite/Remix production build; required before `npm run start`.
- `npm run setup`: runs `prisma generate` and `prisma migrate deploy` so Mongo/SQLite schemas exist before first run.
- `npm run test`: executes Jest using `test/jest.config.json`; pass file globs to narrow scope.
- `npm run lint`: ESLint with caching; ensure a clean run prior to PRs.
- `npm run docker-start` or `docker-start-deploy`: entry points for containerized environments.
- `npm run update-extension`: refreshes Flow extension runtime URLs based on the current `shopify.app.<env>.toml`.

## Coding Style & Naming Conventions
- Use ES modules with two-space indentation and trailing commas where possible. Prefer TypeScript in `*.ts/tsx` but keep Remix route filenames aligned with route paths (e.g., `app.requests.jsx`).
- React components use PascalCase; utility modules stay camelCase. Keep constants in `backend/common/constants.js`.
- When a value is reused across multiple services/modules, or represents a shared classification token (for example cache classes/mutability/policy values like `PERMANENT` or `IMMUTABLE`), define it once as a named constant in `backend/common/constants.js` and import it instead of repeating inline literals.
- Format code through ESLint/Prettier (`@remix-run/eslint-config`); run `npm run lint -- --fix` for autofixes.
- Variable and function names should be descriptive and use camelCase. Never use single leter variables except in very limited scopes (e.g., loop indices).
- Class names should use PascalCase.
- Pages do not need titles.
- Installation receipt badge copy: render "Access Token" as bold text (no help link), use the QuestionCircleIcon help link style for access token and permissions help, and pluralize as "Permission"/"Permissions" (singular when count <= 1) with "scope"/"scopes" (plural only when count > 1).
- For UI typography, keep skeleton and hydrated content on the exact same HTML/CSS for headers and key copy. Prefer shared markup with explicit font styles on the element (e.g., a shared header block with inline styles or a shared class) rather than swapping components or variants that may hydrate late and cause font shifts.
- Skeletons and their rendered counterparts should share as much component structure as possible so size, shape, and placement remain identical.
- Only use Polaris Card when the surrounding background matches the card surface; avoid Card in mixed backgrounds to prevent visible flashes during hydration.
- APIs under app/routes/api/ should be thin with the sole purpose of providing an HTTP interface. They should delegate all business logic to services in `backend/service/`.
- Services in `app/service/` must remain UI-only. Any backend/business logic or external-service interfacing belongs in `backend/service/`.
- Almost every code file should be a class where appropriate. Even utility functions should be grouped into classes.
- Do not store multiple classes in one file. Each class must live in its own file with a matching Jest test.
- Do not shorten constructor argument names; retain the name of the expected incoming class or object (e.g., use aiConversationClientService instead of clientService).
- Follow established patterns used by neighboring classes/files (exports, constructors, dependency wiring, naming, and method shape). Do not introduce one-off patterns when an existing standard already exists in the codebase.
- Do not add defensive safeguards around constructor-injected members (for example, null checks or optional chaining on required dependencies). Fail fast when required constructed members are missing.
- Avoid introducing fallback code paths during refactors. Implement the final desired state directly, and fix construction/wiring issues at the source rather than layering temporary compatibility fallbacks.
- Do not use static methods for internal helper logic. Keep helper methods as normal instance methods (or module-level helpers) and reserve static methods for intentional public class-level APIs.
- Prefer lodash utility functions over custom parsing/normalization helpers when lodash already provides the behavior needed.
- Use consistent variable names across layers, including persisted object field names.
- Place class definitions near the top of the file; keep helper functions below and add unit tests for them.

## Testing Guidelines
- Jest is configured for both frontend and backend under `test/`; mirror source paths (e.g., `test/backend/service/foo.test.js`).
- Name specs `*.test.(js|ts)` and favor descriptive `describe/it` blocks.
- CI expects `npm run test` to pass locally before pushing; add mocks for Shopify/Mongo interactions to keep tests hermetic.
- Unit tests should mock only constructor-level collaborators of the class under test. Do not mock nested/ancillary dependencies of those collaborators.
- Default to a 30s timeout for Codex CLI `shell_command` test runs by passing `timeout_ms: 30000`.
- For each new or updated behavior, do not edit source before adding or updating a unit test (including both negative and positive cases).
- Always run the full suite first, then create a failing test that verifies the new behavior, run the failing test, implement the behavior change, rerun that test until it passes, and then run the full suite.
- Migration-only tests (for temporary compatibility checks, legacy alias guards, or one-time transition assertions) must be removed once the migration is complete.
- Tests should be in the format:
  ```javascript
  describe('MyClass', () => {
    describe('myFunction', () => {
      it('should do something expected', () => {
        // Arrange

        // Act

        // Assert
      });
    });
  });
- All Jest files must use describe('<Class>') → describe('<method>') → it('should …') nesting; reject PRs/tests that don’t.
- Do not attempt to instantiate Request in a test. Simply mock a request object with the properties you need.
  ```
  
## APIEase - Parent project reference
- The APIEase main app project is located at ../apiease.
- Use that project for reference on how APIEase works.
- Use ../apiease/app/routes/api/programmatic.requests.jsx as a reference for how to implement new API endpoints.

## Feature Documentation
- The APIEase Documentation is in a separate project at ../apiease-docs.
- The ../apiease-docs project uses Docusaurus.
- When asked to document a new feature find the appropriate location in ../apiease-docs and create a new markdown file using existing markdown files for reference.
- Update the sidebar.js file in ../apiease-docs to include the new documentation page in the appropriate location.
- When asked to update existing documentation find the appropriate markdown file in ../apiease-docs and make the necessary changes.

## Commit & Pull Request Guidelines
- Write imperative commit subjects under ~72 chars (e.g., `Add webhook retry logging`). Squash local WIP before raising a PR.
- PRs should include: summary of changes, testing evidence (`npm run test`, screenshots for UI tweaks), and links to Jira/GitHub issues.
- Highlight risky migrations (DB, Flow queue) in the PR description and call out any required ops steps.

## Security & Configuration Tips
- Never commit secrets; environment values live in `shopify.app*.toml` and are loaded into `process.env`. Rotate API keys via `/app/settings`.
- Mongo connection strings are composed in `backend/db/client/dbClientClass.js`; use read-only creds for dev.
- Verify incoming system calls by supplying `X_APIEASE_SYSTEM_API_KEY`; keep that value scoped to trusted automation.

## Page Optimization
- Caching strategy: Use `UiCacheController` + `useUiCacheStage` to serve cached UI data immediately, then reconcile with fresh responses to avoid unnecessary re-renders or update loops. Cache when data is stable enough to reuse across navigations and does not risk showing stale state during user actions. Do not cache the Settings page.
- Defer strategy: Use `defer` to split critical vs non-critical loader data for faster first paint. Treat deferred data as initial hydration only; if a fetcher/action updates state, guard against late deferred resolution overwriting newer data (track a "newer data applied" ref or compare versions/timestamps). Use defer when the page can render a meaningful skeleton and tolerate partial data while the rest streams in.
- Contextual save bars: Keep the save bar visible until persistence is confirmed; hide it only after a successful save completes.

## Persisted Page State Pattern
- For persisted pages with draft edits (widgets, permissions, requests), keep three distinct versions of data: `source` (latest server/cache data), `lastSaved` (baseline snapshot used for discard and cache), and `draft` (current edits). Use an optional `pendingSave` snapshot/signature to track in-flight saves.
- Never update `lastSaved` when a save is initiated; update it only when persistence is confirmed or when newer server data resolves. Never replace a dirty `draft` from loader/deferred data; only reset on discard or when clean.
- Use `RouteActionDataSignatureService` (`app/routes/service/RouteActionDataSignatureService.js`) to ignore stale action data during submissions and only show validation errors when a new action signature arrives.
- Use `useDeferredHydrationGuard` with `shouldApplyDeferredIgnoringDirty` so deferred loader data can refresh `source`/`lastSaved` without overwriting dirty drafts.
