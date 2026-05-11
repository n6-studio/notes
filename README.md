# Floe

Floe is an open-source SaaS MVP for fast idea, todo, note, reminder, and bookmark capture.

## Stack

- TanStack Start (React) in this repository root
- Convex (`./convex`) with Better Auth
- Biome for formatting and linting

## Development

```bash
pnpm install
pnpm dev
```

Configure Convex before using persisted data:

```bash
pnpm exec convex dev
pnpm exec convex env set BETTER_AUTH_SECRET <secret>
pnpm exec convex env set SITE_URL http://localhost:3000
```

Then set `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`, and `VITE_SITE_URL` in your environment (see `.env.example`).

Floe uses Better Auth with anonymous users enabled. A fresh visitor receives an anonymous Better Auth session automatically, and captures are owned by an app `users._id` row. The `users.authId` field stores Better Auth's user id; when OAuth providers are added later, anonymous account linking updates `users.authId` while preserving existing capture relationships.

## Verification

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
