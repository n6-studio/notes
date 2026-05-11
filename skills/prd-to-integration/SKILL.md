---
name: prd-to-integration
description: Turns a PRD or selected PRD functionality into Playwright integration tests after frontend and backend implementation exists. Use when the user asks to create, derive, or update integration/E2E tests from a PRD, feature spec, issue, or implemented product behavior; pair with playwright-best-practices when available.
---

# PRD To Integration

Create Playwright integration tests for PRD behavior after frontend and backend implementation exists.

Always use `playwright-best-practices` when available; let it choose Playwright references, patterns, and test shape. If unavailable, ask the user whether to proceed and warn that tests may be flaky without it.

## Process

### 1. Gather source scope

Work from the provided PRD, issue, plan, or conversation. If the user names specific functionality, test only that subset; otherwise cover all in-scope PRD functionality.

- Product-specific PRDs live under `products/<product>/docs/specs/`.
- Repo-wide PRDs live under root `docs/specs/`.

Extract:

- User stories and acceptance criteria.
- Implementation decisions and API contracts.
- Testing decisions and out-of-scope notes.
- Product, route, role, and data assumptions.

If the PRD cannot be located from context or repo paths, ask for the PRD reference.

### 2. Inspect implementation

Inspect frontend, backend, and existing tests before editing.

- Frontend: routes, pages, forms, permissions, validation, loading/empty/error states, responsive or real-time behavior.
- Backend: schema, queries, mutations, actions, APIs, auth, side effects, persistence, validation, and data lifecycle.
- Tests: fixtures, page objects, helpers, auth setup, mock servers, factories, naming, tags, and commands.

Also test implicit behavior surfaced by implementation when it is externally observable and consistent with PRD intent: derived states, constraints, defaults, and cross-layer side effects.

### 3. Build the coverage map

Before editing, produce a short map:

- PRD behavior.
- Implementation surface proving it.
- Test to add/update.
- Required users, data, mocks, and cleanup.

Prefer vertical scenarios that exercise the UI and verify backend-backed outcomes.

### 4. Write Playwright tests

Follow repo-local Playwright conventions first. Reuse existing fixtures/helpers.

If the user approves proceeding without `playwright-best-practices`, use only these fallbacks:
- Prefer user-facing locators and web-first assertions.
- Avoid fixed sleeps.
- Keep tests independent, deterministic, and externally observable.
- Cover validation, permission, empty, loading, and failure states when exposed by the PRD or implementation.

### 5. Run and refine

Run the narrowest relevant command first, then broaden. Inspect `products/*/package.json` and `vite.config.ts`; prefer `pnpm run <product> <task>`.

When a test fails, diagnose before changing assertions. Fix the test when it misunderstood behavior; fix implementation only when it violates the PRD and the user asked you to continue through fixes.

### 6. Report outcome

Summarize concisely:

- Tests added or updated.
- PRD behaviors covered.
- Commands run and results.
- Any PRD behavior left untested, with the blocker.
