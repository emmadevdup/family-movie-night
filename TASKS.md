# Build Task List

*Ordered by dependency. Complete each phase before starting the next. Update status as work progresses.*

---

## Phase 1 — Project foundation

- [x] Initialise Next.js 14+ project with TypeScript and Tailwind CSS
- [x] Configure ESLint and Prettier
- [x] Create Supabase project and save credentials
- [x] Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TMDB_API_KEY`)
- [x] Connect Supabase client library
- [x] Deploy skeleton app to Vercel and confirm live URL works — https://family-movie-night-tau.vercel.app

---

## Phase 2 — Database

- [x] Create `family_members` table
- [x] Create `media` table
- [x] Create `interests` table (with `interest` enum and `watched` boolean)
- [x] Create `series_progress` table
- [x] Create `comments` table
- [x] Add all unique constraints and foreign keys
- [x] Enable Row Level Security on all tables with open policies (no auth)
- [x] Enable Supabase Realtime on `interests`, `series_progress`, `comments`
- [x] Generate and export TypeScript types from Supabase schema

---

## Phase 3 — Avatar assets

- [x] Generate all 11 DiceBear `adventurer` SVGs using fixed seeds and save to `/public/avatars/`
- [x] Create 9 emoji SVG wrappers with coloured circle backgrounds and save to `/public/avatars/`
- [x] Create `AVATAR_LIST` constant mapping each `avatar_id` key to its asset path and display name
- [x] Build `<Avatar>` component: renders circular image with coloured border ring, accepts `avatarId`, `interestState`, `size`, and optional `watched` checkmark overlay

---

## Phase 4 — User identity

- [x] Build "Who's watching?" overlay component (avatar grid, name labels, pre-selected user highlighted)
- [x] Implement localStorage read/write for `activeUserId`
- [x] Show overlay on every app load; dismiss on tap; "Stay as [Name]" shortcut
- [x] Add persistent avatar button in page header that reopens the overlay
- [x] Write Playwright E2E test: identity selection flow

---

## Phase 5 — Family member management (Settings)

- [x] Build Settings page (`/settings`)
- [x] Add family member form (name + avatar picker grid)
- [x] Edit and delete family member
- [x] Avatar picker component (scrollable grid, selection highlight)

---

## Phase 6 — TMDB integration

- [x] Create server-side API route `POST /api/tmdb/search` (accepts title + type, returns list of results)
- [x] Create server-side API route `GET /api/tmdb/details` (accepts tmdb_id + type, returns full metadata including trailer URL)
- [x] Trailer selection logic: first result where `type = "Trailer"` and `site = "YouTube"`
- [x] Poster URL construction: `w500` for cards, `w780` for detail page
- [x] Write unit tests for trailer selection logic

---

## Phase 7 — Add / Edit media

- [x] Build TMDB search step (search box → results list with poster, title, year)
- [x] Build metadata review step (auto-filled fields, all editable, manual fallback form)
- [x] Build interest step (avatar grid, tap to cycle `neutral → yes → no → neutral` for each member)
- [x] Wire up form submission: write to `media` + `interests` tables
- [x] Build Edit page (`/media/[id]/edit`) reusing the same form
- [x] Write Playwright E2E test: add a movie via TMDB

---

## Phase 8 — Catalogue

- [x] Build catalogue page (`/`) with list of media cards
- [x] Build `<MediaCard>` component: poster, title, type badge, duration, platform, genre, summary (truncated), suggested-by, avatar row grouped (yes → neutral → no) with border rings, speech bubble icon
- [x] Watched dimming: slight dim if current user watched; heavy dim + "All seen ✓" banner if all members watched
- [x] Quick-toggle interest: tap own avatar on card cycles interest state (no navigation)
- [x] Filter bar: by type, platform, interest level, hide/show fully-watched
- [x] Realtime subscription: update cards live when interests change

---

## Phase 9 — Detail page

- [x] Build detail page (`/media/[id]`)
- [x] Full poster, full summary, metadata row
- [x] "Watch trailer" button (opens YouTube in new tab; hidden if no trailer URL)
- [x] Interest section: grouped avatars with border rings, tap to cycle state, watched toggle per member
- [x] "All seen ✓" banner if all members watched
- [x] Comments section: each member's comment with avatar + name; tap own comment to edit inline
- [x] Realtime subscription: live updates for interest and comment changes
- [x] Write Playwright E2E test: toggle interest on detail page

---

## Phase 10 — Watched tracking

- [ ] Movies: "Mark as watched" toggle on detail page per family member
- [ ] Series: auto-set `watched = true` in `interests` when `series_progress` reaches `total_episodes`
- [ ] Manual override: allow marking a series watched independently of progress
- [ ] Confirm catalogue card dimming logic works correctly for both cases

---

## Phase 11 — Series tracker

- [ ] Show series tracker section on detail page only when any member has progress
- [ ] Display each member's position as "S1 E4"
- [ ] One-tap `+` to increment episode; auto-advance season when episode count exceeds season length
- [ ] Tap position label to set manually (modal or inline input)
- [ ] Visual indicator: who is ahead / behind / at same point
- [ ] "Finished" badge auto-appears when member reaches `total_episodes`

---

## Phase 12 — Movie night mode

- [ ] Build movie night page (`/movie-night`)
- [ ] Step 1: attendee selector (all family members, multi-tap) + time input (parse "2h", "90min", "1h30")
- [ ] Implement suggestion algorithm in `lib/suggestions.ts`:
  - Hard exclusion: any present member with `interest = 'no'`
  - List A logic (all rules)
  - List B logic + reason tag generation
  - List C fallback (C1 too long, C2 has `no` votes)
  - Ranking by present `yes` count
- [ ] Build results UI: List A, List B (with reason tags), fallback message + List C
- [ ] Series entries show episode count that fits available time
- [ ] Write Vitest unit tests for the full suggestion algorithm (see TESTING.md checklist)
- [ ] Write Playwright E2E test: List A result
- [ ] Write Playwright E2E test: List C fallback

---

## Phase 13 — Remove entry

- [ ] Add "Remove" option on detail page (behind confirmation prompt)
- [ ] Cascade delete: remove associated `interests`, `comments`, `series_progress`
- [ ] Redirect to catalogue after deletion
- [ ] Write Playwright E2E test: remove entry

---

## Phase 14 — PWA

- [ ] Create `manifest.json` (name, icons, `display: standalone`, `theme_color`)
- [ ] Add `apple-touch-icon` meta tags for iOS home screen
- [ ] Configure service worker for offline shell caching (app loads without blank screen offline)
- [ ] Verify install prompt works on Android Chrome
- [ ] Manually test "Add to Home Screen" on iOS Safari and Android Chrome

---

## Phase 15 — Polish & QA

- [ ] Mobile viewport QA on 390px width (iPhone 14)
- [ ] Check all tap targets are ≥ 44×44px
- [ ] Check Realtime updates work across two browser tabs
- [ ] Check "Who's watching?" overlay on every page load
- [ ] Performance check: catalogue loads fast with 20+ entries
- [ ] Run full Vitest suite — all passing
- [ ] Run full Playwright suite — all passing

---

## Phase 16 — Deployment

- [ ] Set all environment variables in Vercel dashboard
- [ ] Deploy to production
- [ ] Smoke test on mobile device (both iOS and Android if possible)
- [ ] Share link with family
