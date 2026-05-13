# Notes

Notes is an open-source capture app for ideas, todos, reminders, and bookmarks. The web UI is built with TanStack Start (React) and talks to a [Convex](https://www.convex.dev/) backend. Authentication uses Better Auth: anonymous sessions work immediately; Google OAuth is supported when you configure it.

## What you get

- **Fast capture** without leaving your flow
- **Convex-backed persistence** with real-time sync
- **Optional Google sign-in** alongside anonymous use

## Stack

- **Frontend:** TanStack Start, React 19, Vite, Tailwind CSS
- **Backend:** Convex (`convex/`) with Better Auth via [kitcn](https://kitcn.dev/) auth helpers
- **Tooling:** Biome (via Ultracite), TypeScript, Vitest

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)
- A [Convex](https://www.convex.dev/) project (the CLI can link or create one for you)

## Local development

Install dependencies and start Convex plus the Vite dev server (port 3000):

```bash
pnpm install
pnpm dev
```

Configure the Convex deployment and required secrets:

```bash
pnpm exec convex dev
pnpm exec convex env set BETTER_AUTH_SECRET "<generate-a-long-random-secret>"
pnpm exec convex env set SITE_URL "http://localhost:3000"
```

Optional — Google sign-in (set both in Convex; see `.env.example` for local reference):

```bash
pnpm exec convex env set GOOGLE_CLIENT_ID "<your-client-id>"
pnpm exec convex env set GOOGLE_CLIENT_SECRET "<your-client-secret>"
```

Copy `.env.example` to `.env.local` (or your preferred env file) and fill at least:

| Variable | Purpose |
| -------- | ------- |
| `VITE_CONVEX_URL` | Convex deployment URL (`.cloud`) |
| `VITE_CONVEX_SITE_URL` | Convex HTTP site URL (`.site`) for the auth proxy |
| `VITE_SITE_URL` | Public origin of the web app (must match `SITE_URL` in dev) |
| `CONVEX_DEPLOYMENT` | Used by Convex CLI when configured |

Better Auth creates anonymous users by default: new visitors get a session without signing in. Captures are tied to a `users` row; `users.authId` stores the Better Auth user id for account linking later.

## Production build

```bash
pnpm build
```

Nitro emits a **Node** server preset under `.output/`:

- Server entry: `.output/server/index.mjs`
- Static assets: `.output/public/`

Smoke-test locally from `.output`:

```bash
node ./server/index.mjs
```

Use the same `VITE_*` values at build time so they are baked into the client bundle.

## Self-hosting

Self-hosting means **you run the web app** on hardware or a cloud you control, while **backend data and auth live in a Convex deployment** you own. This repository does not ship a standalone database in a container; Convex is the hosted backend.

### 1. Convex production deployment

- Install the CLI and log in: `pnpm exec convex login`
- From this repo: `pnpm exec convex deploy` (choose or create a production deployment when prompted)
- In the [Convex dashboard](https://dashboard.convex.dev/) for that deployment, set environment variables:

  | Name | Notes |
  | ---- | ----- |
  | `BETTER_AUTH_SECRET` | Long, random secret |
  | `SITE_URL` | Exact public origin of your site (e.g. `https://notes.example.com`). Avoid mixing trailing-slash styles between here and the app. |
  | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Only if you use Google OAuth |

`SITE_URL` must match the URL browsers use to open the app. It feeds Better Auth `baseURL`, `trustedOrigins`, and related settings.

### 2. Build the web app for production

Set build-time variables in CI, Docker build args, or a Vite-loaded env file (e.g. `.env.production.local`):

| Variable | Value |
| -------- | ----- |
| `VITE_CONVEX_URL` | Your Convex deployment URL (ends with `.convex.cloud`) |
| `VITE_CONVEX_SITE_URL` | Convex HTTP / site URL (ends with `.convex.site`) |
| `VITE_SITE_URL` | Same origin as Convex `SITE_URL` |

Then:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Ship the **contents** of `.output/` to your host (rsync, object storage + compute, or a container image). Start the server with the process working directory at `.output`:

```bash
node server/index.mjs
```

Put a reverse proxy (Caddy, nginx, Traefik, etc.) in front for TLS; forward to the Node process and set `PORT` (or your platform’s port binding) as required by Nitro/Node.

### 3. Google OAuth in production

In Google Cloud Console, set **Authorized JavaScript origins** and **redirect URIs** to match Better Auth and your Convex HTTP routes for your real `SITE_URL`. Wrong redirect URLs are the most common cause of “works locally, fails in prod” after self-hosting the UI.

### 4. Day-two operations

- Run `pnpm exec convex deploy` when you change `convex/*`.
- Rebuild and redeploy the web app when frontend code changes or any `VITE_*` value changes.

## Credits

Built by N6 Studio.

## Verification

From the repo root:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
