# AGENTS.md

Operating instructions for automated and human contributors working in this repository.

## Before you mark work done

- Run and pass: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm lingui:compile`, `pnpm test`, and `pnpm build`.
- Do not claim completion without fresh command output from those checks.

## Translations

After adding or changing user-facing copy, run `pnpm lingui:extract`, fill `src/locales/{it,de,fr,es}/messages.po`, then `pnpm lingui:compile`. `lingui:compile` fails if any target locale is missing a translation.
