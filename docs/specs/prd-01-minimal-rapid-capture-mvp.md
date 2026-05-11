---
type: prd
number: 01
title: Minimal rapid-capture notes (MVP)
last_modified: 2026-05-11
---

## Problem Statement

People need a **fast, low-friction place** to dump text, reminders, links, and occasional images without wading through busy product chrome, nested settings, or noisy layouts. Existing note tools often feel heavyweight at capture time: too many panels, too much decoration, or too much ceremony before the first word lands. Users want **confidence that what they capture is stored reliably** and **retrievable later** with search and light filtering—not a second “inbox to manage.”

## Solution

A **minimal web app** centered on a **reusable chat-style composer**: a large writing surface, compact footer controls for **attachments** and **send**, and **dropdowns to label or categorize** the entry. The visual language is **black-first, ultra-minimal**: a **thin transparent top bar**, almost no decoration, and **micro-details** only where they aid clarity.

The experience splits into three primary surfaces:

1. **Landing (first screen)** — Hero **title** and **subtitle** centered in the upper-middle of the viewport; below that, the **same composer** as the rest of the app (input group: main field + categorization dropdowns). Submitting from landing runs a **short onboarding flow**: **anonymous sign-in**, **attach the new note to that user**, then navigate to **home**.

2. **Home (authenticated)** — **Same spirit as landing** but **without** the large title/subtitle so the screen stays calm. The **same Chat Composer** is reused.

3. **Library** — A **timeline** list of the user’s notes. Users can **open a note**, run **full-text search**, **filter by date**, and **change sort order**. MVP supports **timeline layout only** (no grid, no kanban).

**Convex** backs persistence, queries, and file storage. **Better Auth** on Convex provides **Google OAuth** as the primary provider and **anonymous sessions** so first capture never blocks on account creation.

## User Stories

1. As a **visitor**, I want to **see a calm black landing screen** with a clear hero and composer, so that **I understand what the product is without reading marketing paragraphs**.

2. As a **visitor**, I want a **minimal top bar** with only essential navigation, so that **nothing competes with writing**.

3. As a **visitor**, I want to **type a note quickly** in a large primary field, so that **capture feels like a chat or scratchpad—not a form**.

4. As a **visitor**, I want **dropdowns to label or categorize** what I’m entering, so that **later retrieval is easier without slowing me down now**.

5. As a **visitor**, I want to **attach one or more images** to a note, so that **visual context is preserved with the same dump-and-go rhythm**.

6. As a **visitor**, I want to **include an optional link** (or links in body—see decisions), so that **I can stash references alongside prose**.

7. As a **visitor**, I want to **set or skip a reminder time**, so that **time-sensitive items can surface without a separate reminders app**.

8. As a **visitor**, when I **submit from the landing composer**, I want the app to **sign me in anonymously**, **save my note to my new identity**, and **take me to home**, so that **first value is one action—not an account wall**.

9. As an **anonymous user**, I want my **notes to persist** across sessions on the same device/browser where the auth session lives, so that **“quick dump” still feels safe**.

10. As a **signed-in user (Google)**, I want to **link or continue** with a recognizable identity (post-MVP linking—see scope), so that **I can trust backup and access patterns**.

11. As a **home user**, I want the **same composer** as the landing page, so that **muscle memory and UI consistency stay intact**.

12. As a **home user**, I want the **home screen to drop hero chrome**, so that **return visits feel quiet and focused**.

13. As a **library user**, I want a **timeline of my notes**, so that **recent thought stays visible in time order**.

14. As a **library user**, I want **full-text search across note content**, so that **I can find a half-remembered phrase**.

15. As a **library user**, I want **filtering by date** (for example by day or range—see decisions), so that **I can narrow to “last Tuesday” without scrolling aimlessly**.

16. As a **library user**, I want to **sort the timeline** (for example newest-first vs oldest-first), so that **I can match how I’m thinking about the list**.

17. As a **library user**, I want to **open a note** and see **its text, attachments, labels, links, and reminder metadata**, so that **one screen answers “what did I mean.”**

18. As a **product team**, we want **Convex file storage** for attachments with **metadata tied to notes**, so that **images round-trip reliably with the note record**.

19. As a **product team**, we want **server-side authorization** so users **only read and mutate their own notes**, so that **privacy is enforced by default**.

20. As a **design-minded user**, I want **subtle micro-details** (spacing, focus rings, hairline separators) **without visual noise**, so that **the UI feels crafted, not flashy**.

21. As a **developer**, I want a **reusable Chat Composer component** with a **`landing` vs `home` variant**, so that **one implementation powers both entry surfaces**.

22. As a **developer**, I want the composer to expose a **simple composition-friendly API** (props/slots rather than boolean soup), so that **future screens can reuse it without forks**.

23. As a **future user**, I may want **upgrade from anonymous to Google** without losing notes—**account linking** is planned beyond MVP unless elevated (see scope).

24. As a **mobile browser user**, I want the composer and library to **remain usable on small viewports**, so that **capture still works on a phone** even if the MVP is desktop-first polish.

25. As a **team shipping MVP**, we want **instrumentation hooks reserved** (not necessarily built) for **failed saves and auth errors**, so that **quality can harden quickly after launch**.

## Implementation Decisions

- **Frontend stack:** TanStack Start on **Vite** with **React** and **Nitro** deployment adapter; **shadcn/ui** components installed via CLI using preset **`b7ClRmgEa`** (preset defines a **bundled set** of components—not necessarily every component in the global registry unless separately specified).

- **Backend:** **Convex** for database queries/mutations, real-time updates, and **file storage** for image attachments.

- **Auth:** **Better Auth** integrated with Convex; **Google OAuth** as primary social provider; **anonymous authentication** enabled for the landing capture flow. **Anonymous-to-Google account linking** is **out of MVP**; MVP assumes users either stay anonymous or sign in with Google for a separate session (linking deferred to avoid scope creep).

- **Note model (MVP):** Single **`notes`** table (or equivalent) with: **rich text/plain body**, optional **`remindAt`** timestamp on the same document (no separate reminders table for MVP), optional **primary `linkUrl`** field for quick stash plus **links allowed inside body**, **`labels` or `category`** as **user-defined short strings** (simple strings or small list—not a rigid global enum) chosen from composer dropdowns backed by **recent / user-suggested values** or freeform where needed.

- **Attachments:** Store **Convex storage IDs** and metadata (e.g. content type, size, optional name) **in an `attachments` table** referencing the parent note, or embedded array on note—implementation chooses normalized **`attachments`** for clarity and querying.

- **Search:** Use **Convex search indexes** (or equivalent GA API) over note **body and label text**, with UI invoking a dedicated **search query**. Exact field weighting and fuzzy behavior are left to implementation; PRD requires **user-perceived full-text search**, not literal substring-only filtering over unindexed scans at scale.

- **Library filters:** **Date filter** implemented as **created-at / updated-at bounds** with a **timeline ordered by chosen sort**; MVP layout is **timeline only**.

- **Landing pipeline:** On submit: validate input → **ensure anonymous session** (or create) via Better Auth → **mutation creates note** scoped to authenticated user id from Convex auth context → **navigate to `/home`** (or equivalent).

- **Navigation:** **Stripped navbar**: links to **Home**, **Library**, and **Sign in with Google** (when anonymous) / **account affordance** when signed in—no decorative brand chrome beyond a wordmark if needed.

- **Theming:** **Black background**, light typography, **transparent nav**, **contrast-safe focus states**.

## Testing Decisions

- **Principle:** Prefer tests that assert **observable behavior** (DOM, routes, network mocks) over **implementation details** (private hooks, internal state shapes).

- **Modules under test (target):** **`ChatComposer`** (submit disabled/enabled, attachment picker wiring), **landing anonymous pipeline** (integration: mocked auth client + navigation), **library** (search input updates results, date filter and sort affect ordering)—exact tooling to match repo setup (Vitest + Testing Library; Playwright later per `prd-to-integration`).

- **Convex:** After backend stabilizes, add **`prd-to-convex-tests`-style** integration tests for **authz** (user A cannot read user B notes) and **note CRUD**.

- **Prior art:** Greenfield—establish patterns alongside first features; keep tests **thin but representative** for MVP.

## Out of Scope (MVP)

- **Anonymous → Google account linking** and **data merge** workflows.

- **Non-timeline layouts** (grid, boards, nested notebooks).

- **Collaboration**, **sharing**, **comments**, **public URLs**.

- **Rich formatting beyond pragmatic needs** (heavy WYSIWYG, slash commands, embeds).

- **Mobile native apps**, **offline-first sync**, **conflict resolution**.

- **Push notifications** for reminders (storage of `remindAt` may exist without notification delivery).

- **Import/export**, **bulk operations**, **admin dashboards**.

- **Literal installation of every shadcn registry component** if not included in the chosen preset.

## Further Notes

- The **composer is the product keel**: invest in **keyboard flow**, **clear disabled states**, and **fast submit**. Keep **category/label dropdowns** from stealing focus from writing.

- **Better Auth secrets and OAuth client configuration** are **environment-specific**; document required vars for **local dev** vs **production** without committing secrets.

- **Image uploads** should fail gracefully with **inline error** near the composer footer; never **silent drop**.

- **Performance:** Pagination or “load more” for the timeline is acceptable once lists grow; MVP can ship with **reasonable caps** + **indexed queries**.
