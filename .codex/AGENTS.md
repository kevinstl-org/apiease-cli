# Codex Automation Rules

If `AGENTS.md` exists at the project root, that file defines project-level coding standards.

This `.codex/AGENTS.md` file defines Codex workflow rules:

- Always use test driven development for new behavior: write or modify tests, run and see them fail, then implement the behavior until it passes.
- Confirm each new test fails against existing behavior before any implementation changes so the test proves it can detect the missing behavior.
- Run `.codex/run_test_suite.sh` before starting work on a task and again after completing the task. If the project AGENTS.md file says to run all tests in a specific way assume that `.codex/run_test_suite.sh` runs the project specific way so there is no need to run both.
- Fix only the tests related to the current task. If other tests fail outside the task scope, warn about them but do not modify them.
- Ensure scripts and test scripts are runnable from any working directory by resolving paths relative to their own script directory.
- When all acceptance criteria are satisfied do write a brief completion summary.
- When all acceptance criteria are satisfied do not attempt or ask to work on another task.

When both `AGENTS.md` and `.codex/AGENTS.md` exist:

- Root `AGENTS.md` takes precedence for coding standards, architecture, naming, and formatting.
- `.codex/AGENTS.md` takes precedence for Codex workflow behavior such as TDD, test execution rules, and task scoping.

Codex should follow both documents.

---

## Code structure and design preferences

In addition to the rules above, Codex must follow these guidelines when generating or modifying code and tests in this project:

### File and module boundaries

- Prefer creating a new code file when there is a need for functionality that is not clearly described or represented by any existing code file.
- Each file should be purpose driven with a clear, cohesive responsibility. Avoid turning any file into a generic catch all of unrelated utilities.

### Redundant functionality

- Before creating a new function, search the codebase for existing functions that provide the same or similar behavior.
- If a suitable function exists, reuse or extend that function instead of creating a new one with overlapping responsibilities.
- If you find redundant or near redundant functions scattered across multiple files, create a dedicated module for that shared behavior:
  - Introduce a new code file whose purpose is to contain that shared functionality.
  - Move or refactor the redundant implementations into that module.
  - Update callers to use the new shared function(s).

### Function design and naming

- Functions should be small, focused, and single purpose. Each function should “do one thing well.”
- A general rule of thumb can be that a function should be no larger than 10 lines of code.
- Function names must be explicit and self documenting, clearly describing:
  - What the function does.
  - The main thing it returns or the main side effect it has.
- Avoid vague names like `handleData`, `processItems`, or `doWork`. Prefer names such as `filterRequestsByShopDomain` or `buildTaskSchemaFromGoal`.

### Variable naming

- Variable names must always be meaningful and descriptive.
- Avoid single letter or cryptic abbreviations (for example `d`, `x`, `cfg`) except in very small, conventional scopes (for example a simple for loop index).
- Prefer names that reveal intent over names that reflect only type or structure. For example:
  - Use `requestQueue` instead of `list`.
  - Use `shopDomainToRequestMap` instead of `map`.
- Try to use consistent variable names across code files for similar concepts or data structures.

### Tests and expectations

- Whenever possible, create or update tests alongside each new or modified function:
  - Tests should only be created for code unless the task explicitly requires testing non-code behavior.
  - Any new production code file (class/module/component/service/utility) must include a corresponding Jest test file created or updated in the mirrored `test/` path in the same change set.
  - New public methods on existing classes must add or update tests in the related test file.
  - Ensure that each public or externally used function has at least one corresponding test when feasible.
  - Prefer one primary expectation per test:
    - Do not pack multiple unrelated expectations into a single test.
    - Only group multiple expectations in one test when those expectations always apply to every usage of the function and together define a single behavior.
  - During iterative development (multiple small code changes within a task), Codex should run only the tests associated with the code being modified, unless broader test execution is explicitly required. Full test suite runs should still occur at the start of the task and after completion to ensure no regressions.
  - For each unique behavior, edge case, or error condition, create a separate test. For example:
    - One test for normal success behavior.
    - One test for invalid input handling.
    - One test for boundary conditions.
  - Keep tests clear and intent revealing:
    - Test names should describe the specific behavior being verified.
    - Arrange tests using the standard “arrange, act, assert” structure where practical.

### Development Philosophy
- You have total control of the entire codebase.
  - Do not keep redundant code, functions, variables or tests around for backwards compatibility unless explicitly required by the task.
  - Do not use abbreviations or acronyms unless they are widely known and accepted in the project domain.

These guidelines are intended to keep the codebase modular, easy to navigate, and self documenting so that Codex automation and humans can both work effectively within this project.

---

## Frontend/Backend Responsibility Rule (Must Follow)
- All user input must be sent to a backend service as early as possible.
- Business decisions, persistence, and side effects must happen server-side.
- The frontend must only handle UI state and rendering; it must not be a source of truth or perform persistence or routing logic.
- If existing code violates this, refactor toward server-side authority before adding features.
