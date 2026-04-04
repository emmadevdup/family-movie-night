# Coding Practices

*Rules that apply to every file in this project. Read before writing any code.*

---

## General principles

- Write the simplest code that solves the problem. Do not add abstractions for hypothetical future needs.
- Do not add error handling, fallbacks, or validation for scenarios that cannot happen. Validate at system boundaries only (user input, TMDB API responses, Supabase responses).
- Do not add comments unless the logic is genuinely non-obvious. Good names are better than comments.
- Do not add features, refactor, or "improve" code beyond what the current task requires.

---

## TypeScript

- Strict mode on (`"strict": true` in `tsconfig.json`). No `any` unless unavoidable and explicitly commented.
- Generate database types from Supabase schema — do not write them by hand. Re-generate after schema changes.
- Prefer `type` over `interface` for data shapes. Use `interface` only for objects that will be extended.
- Never cast with `as` to silence a type error — fix the type instead.

---

## Next.js conventions

- Use the App Router. No Pages Router.
- Default to **Server Components**. Only add `"use client"` when the component needs browser APIs, event handlers, or React state.
- Data fetching happens in Server Components or Next.js API routes — never directly from client components to Supabase or TMDB.
- TMDB API calls go through `/api/tmdb/*` routes. The `TMDB_API_KEY` must never appear in client-side code.
- Keep API routes thin: validate input, call a service function, return the result. Business logic lives in `lib/`.

---

## File and folder structure

```
/app                  # Next.js App Router pages and layouts
/app/api              # API routes (TMDB proxy, etc.)
/components           # Shared React components
/lib                  # Pure logic: suggestion algorithm, avatar list, helpers
/lib/supabase.ts      # Supabase client initialisation
/lib/suggestions.ts   # Movie night algorithm (pure function, no side effects)
/public/avatars       # Pre-generated avatar SVG assets
/types                # Supabase-generated types + any additional shared types
```

No barrel files (`index.ts` re-exports) unless there are more than 5 exports from a folder and it genuinely reduces import noise.

---

## Components

- One component per file. File name matches component name in PascalCase.
- Props are typed inline or with a local `type Props = {}` — not exported unless another file needs them.
- Keep components focused. If a component needs more than ~150 lines, consider whether it is doing too much.
- Do not reach into a child's internals. Pass props down or use composition.

---

## Styling

- Tailwind CSS only. No CSS modules, no styled-components, no inline `style` props except for dynamic values that cannot be expressed as Tailwind classes (e.g. a user-specific avatar background colour).
- Mobile-first: write base styles for 390px, add `md:` and `lg:` breakpoints only when needed.
- Minimum tap target: 44×44px for all interactive elements (`min-h-11 min-w-11` in Tailwind).
- Do not use arbitrary Tailwind values (e.g. `w-[137px]`) unless there is no standard value close enough.

---

## Data and state

- Server state (Supabase data) is the source of truth. Do not duplicate it in React state.
- Use Supabase Realtime subscriptions for live updates on `interests`, `series_progress`, `comments`. Unsubscribe in the component cleanup.
- `activeUserId` (the current family member) lives in `localStorage` only. Do not put it in a global React context unless multiple unrelated components need it — pass it as a prop instead.
- Never mutate data optimistically without being prepared to roll back on error.

---

## Security

- The `TMDB_API_KEY` is server-side only (`TMDB_API_KEY`, not `NEXT_PUBLIC_`).
- Supabase anon key is public by design — it is safe in client code, but RLS policies are the access control layer.
- Validate and sanitise all user-supplied strings before writing to the database (title, notes, comment body).
- Never construct SQL queries by string concatenation. Use Supabase's query builder exclusively.
- Do not store sensitive data in `localStorage` beyond `activeUserId`.

---

## The suggestion algorithm (`lib/suggestions.ts`)

- Must be a **pure function**: takes catalogue data + session inputs, returns lists. No side effects, no Supabase calls inside it.
- This makes it fully unit-testable with Vitest without any mocking.
- All filtering rules and ranking logic must match the spec in CLAUDE.md exactly. If the spec changes, update the tests first, then the code.

---

## Testing

- See `TESTING.md` for the full strategy and test checklist.
- Unit tests live next to the code they test: `lib/suggestions.test.ts` alongside `lib/suggestions.ts`.
- Playwright tests live in `/e2e`.
- Do not skip or comment out failing tests — fix them or delete them with a documented reason.

---

## Git

- Commit messages are short and imperative: `add movie night algorithm`, `fix interest toggle on card`.
- One logical change per commit. Do not bundle unrelated changes.
- Do not commit `.env.local` or any file containing API keys.
