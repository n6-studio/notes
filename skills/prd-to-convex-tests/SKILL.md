---
name: prd-to-convex-tests
description: Turns PRD functionality into Convex backend integration tests with convex-test after backend implementation exists. Use when creating or updating Convex backend tests from a PRD, feature spec, issue, or implemented Convex behavior; pair with tdd and local Convex test guidelines when available.
---

# PRD To Convex Tests

Create Convex backend tests that verify PRD behavior against the implemented backend.

Use `tdd` when available. Work in tracer bullets: map behavior, add one test, run it, refine, then continue.

## Process

### 1. Scope the PRD

Work from the provided PRD, issue, plan, or conversation. If the user names specific functionality, cover only that subset; otherwise cover all backend-relevant PRD behavior.

PRDs commonly live under `products/<product>/docs/specs/` or root `docs/specs/`.

Extract user stories, acceptance criteria, API contracts, testing decisions, out-of-scope notes, and product/backend/auth/data assumptions.

If the PRD cannot be located from context or repo paths, ask for the PRD reference.

### 2. Read local guidance

Before designing tests, read these when present:

- Root `AGENTS.md` and product/package `AGENTS.md`.
- `docs/agents/CONVEX-SERVER.md`.
- `docs/agents/CONVEX-TESTS.md`.
- `products/**/convex/_generated/ai/guidelines.md` for the touched backend.

Use repo-local guidance over generic Convex advice.

### 3. Inspect backend

Inspect implementation before writing tests: schema, indexes, validators, queries, mutations, actions, HTTP handlers, application/data/auth layers, existing tests, fixtures, harnesses, module globs, and commands.

Look for implicit PRD behavior surfaced by implementation, such as defaults, derived state, persisted side effects, lifecycle transitions, authorization rules, validation boundaries, cleanup, cascade behavior, or cross-feature state changes. Add tests for implicit behavior only when it is externally meaningful and consistent with PRD intent.

### 4. Map coverage

Before editing, produce a short map: PRD behavior, API or application entrypoint, backend surface that proves it, setup data/auth/mocks/cleanup, and expected result/state/side effect/failure.

Prefer vertical backend integration scenarios over isolated implementation checks.

### 5. Write Convex tests

Use `convex-test` for behavior involving persistence or Convex functions.

Prefer:

- Existing `convexTest(schema, modules)` harnesses or module globs.
- `t.query`, `t.mutation`, or `t.action` for public APIs.
- `t.run` with application functions plus real data deps when auth/app wiring blocks public APIs.
- Public APIs or stable data accessors for assertions.
- Fake timers for time-dependent behavior.

Avoid private implementation tests, bulk-writing all PRD tests before running any, mocking local data modules when the real DB path is practical, and direct DB assertions when a stable public query or data accessor better expresses behavior.

For application code that writes to the DB, include `convex-test` coverage proving the persisted shape. Application-layer unit tests are useful for pure orchestration, but mocks alone do not prove persistence.

### 6. Run and refine

Run the narrowest relevant backend test first, then broaden if needed.

Use repo command conventions: inspect `products/*/package.json` and backend scripts, prefer `pnpm run <product> <task>` when available, and run Convex tests in Vitest edge runtime through the backend's existing `vp test run` or equivalent.

When a test fails, diagnose before changing assertions. Fix the test if it misunderstood intended behavior. Report implementation drift when the backend violates the PRD; fix implementation only if the user asked to continue through fixes.

### 7. Report outcome

Summarize tests changed, PRD behaviors covered, implicit behaviors covered, commands run, and any backend-relevant PRD behavior left untested with its blocker.

If ambiguity blocks meaningful tests, ask for the smallest missing decision.
