# Testing Strategy

*This file is maintained alongside the spec. Update it whenever features are added or the strategy evolves.*

---

## Strategy

Two layers, chosen for maximum confidence at minimum overhead for a family-scale app:

| Layer | Tool | Scope |
|---|---|---|
| Unit | **Vitest** | Pure logic — movie night algorithm, filtering, ranking |
| End-to-end | **Playwright** | Critical user flows in a real browser |

Add component or integration tests later if complexity warrants it.

---

## Unit tests — Vitest

### What to test

#### Movie night algorithm (`lib/suggestions.ts` or equivalent)
This is the most critical logic in the app. Every rule must be covered.

**List A eligibility:**
- [ ] Entry with all present members `yes` or `neutral`, no absent `yes`, not watched, fits time → List A
- [ ] Entry where one present member is `no` → excluded from all lists
- [ ] Entry where an absent member is `yes` → List B, not List A
- [ ] Entry where a present member has `watched = true` → List B, not List A
- [ ] Movie runtime exactly equal to available time → List A
- [ ] Movie runtime 1 min over available time → List B (too long)
- [ ] Series: at least one episode fits → List A
- [ ] Series: zero episodes fit → List B (too long)

**Ranking:**
- [ ] Entry with 3 present `yes` votes ranks above entry with 1 present `yes` vote
- [ ] `neutral` votes do not contribute to ranking score
- [ ] Entries with equal `yes` count maintain stable order

**List B reason tags:**
- [ ] Absent member with `yes` → correct name in reason tag
- [ ] Present member with `watched = true` → correct name in reason tag
- [ ] Duration over limit → correct overage in minutes in reason tag
- [ ] Multiple reasons on same entry → all tags shown

**Fallback (List C):**
- [ ] Lists A and B both empty → fallback triggered
- [ ] C1: entries too long but no `no` votes → appear with "2 evenings" label
- [ ] C2: entries with at least one present `no` vote → appear below C1
- [ ] C1 and C2 each ranked by present `yes` count

**Edge cases:**
- [ ] No entries in catalogue → empty state, no crash
- [ ] All entries already watched by all present → all go to List B
- [ ] Only one family member present
- [ ] All family members present

#### Catalogue filtering and sorting
- [ ] Genre filter shows only entries matching the selected genre
- [ ] Sort `date` (default) shows most recently added entries first
- [ ] Sort `alpha` shows entries in alphabetical title order
- [ ] Filters combine correctly (e.g. genre + type filter applied together)

#### Notification dot (`lib/lastSeen.ts` + `computePendingIds`)
- [ ] `computePendingIds` returns IDs of media added after `lastSeen` where the member is `neutral`
- [ ] Media added before `lastSeen` is not included
- [ ] Media where member has `interest = 'yes'` or `'no'` is not included
- [ ] `computePendingIds` returns `[]` when `lastSeen` is `null`
- [ ] `hasUnvoted` returns `true` when at least one pending ID is still `neutral`
- [ ] `hasUnvoted` returns `false` when all pending IDs have been voted on

#### Interest state cycling
- [ ] `neutral → yes → no → neutral` cycle is correct
- [ ] Default state for a new member/entry is `neutral`

#### Watched auto-detection (series)
- [ ] Progress equal to `total_episodes` → `watched` set to `true`
- [ ] Progress one short of `total_episodes` → `watched` remains `false`
- [ ] Manual override persists even if progress is reset

---

## End-to-end tests — Playwright

### Environment
- Run against a local Supabase instance (`supabase start`)
- Seed the database with a small fixed dataset before each test run
- Run on Chromium at 390×844 (iPhone 14 viewport) as primary; add desktop as secondary

### Flows to cover

| # | Flow | Key assertions |
|---|---|---|
| 1a | **First launch — no members** | "Who's watching?" overlay appears; no avatars shown; "Go to Settings" button is visible and navigates to `/settings`; overlay is dismissed on navigation |
| 1b | **Identity selection** | "Who's watching?" overlay appears on load; selecting a user dismisses overlay and shows their avatar in the corner; switching mid-session updates active user |
| 2 | **Add a movie via TMDB** | Search returns results with posters; selecting a result fills all fields; interest step allows toggling family members; saved entry appears in catalogue with poster and summary |
| 3 | **Toggle interest on a card** | Tapping own avatar cycles through `neutral → yes → no`; border ring colour updates; avatar moves to correct group on card |
| 4 | **Movie night — List A result** | Set up entries and interests; enter attendees and time; correct entry appears in List A; reason tags absent |
| 5 | **Movie night — fallback (List C)** | Configure data so A and B are empty; fallback message appears; C1 and C2 entries shown with correct labels |
| 6 | **Remove an entry** | Tap Remove on detail page; confirmation prompt appears; confirming deletes entry from catalogue |
| 7 | **Genre filter** | Select a genre in the filter bar; only entries with that genre appear; clearing filter restores full list |
| 8 | **Sort catalogue** | Default order is newest-first; toggling to A→Z sorts alphabetically; toggling back restores date order |
| 9 | **Notification dot — appears** | Log in as user A; add a new entry; log in as user B (who hasn't voted); red dot appears on user B's avatar in the overlay |
| 10 | **Notification dot — clears** | After user B votes on the new entry, the header dot disappears without page reload |

### What is not E2E tested
- TMDB API responses (mocked at the Next.js API route level)
- Supabase Realtime (manual / future)
- PWA install flow (manual verification on device)

---

## CI

- Vitest: run on every push via GitHub Actions (fast, no external deps)
- Playwright: run on pull requests against a local Supabase instance spun up in CI
- Both must pass before merging to main

*Add CI config (`/.github/workflows/test.yml`) when the project is initialised.*

---

## Future layers (add when needed)

- **Component tests** (React Testing Library): if UI components grow complex
- **Supabase RLS tests**: verify row-level security policies if access rules become non-trivial
- **Visual regression** (Playwright screenshots): if the design stabilises and regressions become a concern
