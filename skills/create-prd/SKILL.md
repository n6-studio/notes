---
name: create-prd
description: Creates numbered PRDs through write-a-prd, stored in docs/specs with metadata and last_modified. Use when the user wants to create, write, or update a PRD, especially with numbered PRD files or PRD metadata.
---

# Create PRD

Wrapper around `write-a-prd`. Use it for interview, repo exploration, module design, and PRD body; this skill only overrides publishing.

## Dependency

Before starting, verify `write-a-prd` exists at `.agents/skills/write-a-prd/SKILL.md` or in the active skills list. If missing, stop and say:

> The `write-a-prd` skill is required. Install it from the `mattpocock/skills` repo, then retry.

## Workflow

1. Load and follow `.agents/skills/write-a-prd/SKILL.md`.
2. When it says to submit or publish, write a local Markdown spec using the rules below.
3. Do not publish a GitHub issue unless the user explicitly asks.

## Publish Rules

Destination:

- Product PRD: `products/<product>/docs/specs/`
- Repo-wide PRD: `docs/specs/`
- If product scope is unclear, ask before writing.
- Create the destination directory if missing.

Filename:

```text
docs/specs/prd-<NN>-<prd-slug>.md
products/<product>/docs/specs/prd-<NN>-<product-slug>-<prd-slug>.md
```

Numbering:

- `NN` is two-digit and globally incremental across `docs/specs` and `products/*/docs/specs`.
- Find existing numbers from `prd-[0-9][0-9]-*.md` files whose frontmatter has `type: prd`.
- New PRD: use highest existing number + 1, or `01` if none exist.
- Update: keep existing filename and `number`.

Slugs:

- `product-slug`: product folder name, lowercased and hyphenated if needed.
- `prd-slug`: short, lowercase, hyphenated, derived from title or feature slug.

Frontmatter:

```md
---
type: prd
number: 01
title: Human readable PRD title
last_modified: YYYY-MM-DD
---
```

Use the current local date for `last_modified`; refresh it on updates.

## PRD Body

After frontmatter, use the exact `write-a-prd` sections unless the user asks otherwise. Avoid volatile file paths and code snippets unless explicitly requested.

## Testing

When the user wants tests from a PRD:

- Use the `tdd` skill for test-first implementation work.
- Use the `prd-to-integration` skill for frontend integration tests.
- Use the `prd-to-convex-tests` skill for backend tests only when the relevant product or package uses Convex.
