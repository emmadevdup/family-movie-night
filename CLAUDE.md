# Family Movie Night Selector

## Project Overview

**App name: Super Famille Movies**

A Progressive Web App (PWA) for family use that helps manage a shared list of movies and series, track who wants to watch what, and intelligently suggest the best option on movie night based on who is present and how much time is available.

The app must be simple, fast, and mobile-first. Every interaction that family members repeat regularly (marking interest, updating series progress) must require as few taps as possible.

See **[TESTING.md](./TESTING.md)** for the test strategy and test requirements. That file is maintained in sync with this spec.
See **[E2E-USE-CASES.md](./E2E-USE-CASES.md)** for the plain-language user journeys. Maintain this file in parallel with TESTING.md — when a feature changes, update both.
See **[CODING-PRACTICES.md](./CODING-PRACTICES.md)** for rules that apply to every file in this project. See **[CODING-PRACTICES-PLAIN.md](./CODING-PRACTICES-PLAIN.md)** for the plain-language version — maintain both in parallel.
See **[TASKS.md](./TASKS.md)** for the phased build task list. See **[TASKS-PLAIN.md](./TASKS-PLAIN.md)** for the plain-language version — maintain both in parallel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL + Realtime) |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| PWA | next-pwa or custom service worker |

### Key constraints
- Deploy on Vercel (free tier)
- Database on Supabase (free tier)
- App must be installable on iOS and Android via "Add to Home Screen"
- Must work well on mobile screens (primary use case)

---

## Data Model

### `family_members`
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | display name |
| avatar_id | text | key identifying the chosen avatar (e.g. `"fox"`, `"astronaut"`). See Avatar System below. |
| created_at | timestamptz | |

### `media`
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| title | text | |
| type | enum | `movie` or `series` |
| duration_minutes | integer | For movies: runtime. For series: typical episode length |
| suggested_by | uuid | FK → family_members.id |
| platform | text | e.g. Netflix, Disney+, Prime (optional) |
| genre | text | auto-filled from TMDB, editable |
| notes | text | optional free text |
| total_seasons | integer | Series only. Used to determine when a member has finished the series |
| total_episodes | integer | Series only. Total episode count across all seasons |
| tmdb_id | integer | TMDB identifier, stored for reference |
| poster_url | text | Full TMDB image URL, e.g. `https://image.tmdb.org/t/p/w500{poster_path}` |
| summary | text | Synopsis from TMDB, editable |
| trailer_url | text | YouTube trailer URL sourced from TMDB video data |
| cast | text | Comma-separated top-5 actor names from TMDB credits, editable |
| release_year | integer | Year of release / first air date from TMDB |
| created_at | timestamptz | |

### `interests`
Tracks each family member's interest and watched status per media entry.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| media_id | uuid | FK → media.id |
| family_member_id | uuid | FK → family_members.id |
| interest | enum | `yes` \| `no` \| `neutral`. Default: `neutral` |
| watched | boolean | default false. For movies: manually toggled. For series: auto-derived (see below) |
| created_at | timestamptz | |

Unique constraint on `(media_id, family_member_id)`.

**Interest states:**
- *(no record)* — user has never voted on this entry. Shown as a dimmed (50% opacity) avatar with no ring. Triggers the blue notification dot. Treated as "willing to watch" for List A eligibility.
- `neutral` — explicitly "I don't mind either way". Grey ring. Clears the notification dot. Treated as "willing to watch" for List A eligibility.
- `yes` — actively wants to watch. Green ring. Counts toward the ranking score.
- `no` — explicitly does not want to watch. Red ring. Moves the entry to List B / List C.

**Watched logic for series:** A family member's `watched` flag is automatically set to `true` when their `series_progress.episode` count equals `media.total_episodes`. It can also be manually set to `true` (e.g. if they watched it before the app existed). Manual override takes precedence.

### `series_progress`
Per-family-member episode tracking. Only relevant once a series has been started.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| media_id | uuid | FK → media.id (series only) |
| family_member_id | uuid | FK → family_members.id |
| season | integer | current season |
| episode | integer | last episode watched |
| updated_at | timestamptz | |

Unique constraint on `(media_id, family_member_id)`.

A series is considered "started" if at least one family member has a `series_progress` record for it.

### `comments`
One comment per family member per media entry, editable at any time.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| media_id | uuid | FK → media.id |
| family_member_id | uuid | FK → family_members.id |
| body | text | free text, no length limit enforced |
| updated_at | timestamptz | updated on every edit |

Unique constraint on `(media_id, family_member_id)`.

---

## Features

### 1. Catalog (Home screen)

- List of all movies and series
- Each card shows:
  - Movie poster (left side, portrait thumbnail from TMDB)
  - Title, type badge, duration, platform, genre
  - Summary (truncated to 2–3 lines with a fade)
  - Who suggested it
  - **Avatar row grouped by interest state**, in order: `yes` group first, then `neutral`, then `no`. Within each group avatars are shown side by side. Each avatar has a **coloured border ring**: green = `yes`, light grey = `neutral`, red = `no`. A small checkmark badge overlaid on the avatar indicates the member has watched it.
  - Speech bubble icon if any comment exists
- **Card dimming rules:**
  - If the current user has watched the entry: card is slightly dimmed
  - If **every** family member has `watched = true`: card is heavily dimmed and shows a "All seen ✓" banner across the poster — the clearest signal that this one is done for everyone
- Filter/sort: by type (movie/series), by platform, by genre, by interest level (all / ★ Yes / ? Unvoted), toggle to hide/show fully-watched entries, toggle sort between "recent first" (default) and "A→Z" alphabetical
- Quick-toggle interest: tapping your own avatar on the card cycles through `neutral → yes → no → neutral`. No navigation required.
- Tap anywhere else on the card to open the detail page

### 2. Add / Edit Media

**Adding a new entry uses a TMDB-powered search flow:**

1. User types a title (movie or series) into a search box
2. App queries the TMDB search API and displays results as a list: poster thumbnail, title, year, type
3. User taps the correct result
4. The following fields auto-fill from TMDB: title, type, duration, genre, poster, summary, trailer URL, total\_seasons, total\_episodes (series), cast (top 5 actors), release year, platform (from TMDB Watch Providers for France — first flatrate/streaming provider)
5. User fills in the remaining fields: who suggested it, platform (pre-filled but editable), notes. `suggested_by` defaults to the currently active user.

6. **Interest step**: all family member avatars are shown in a grid, all starting dimmed ("no vote"). The person adding the entry can tap each avatar to record their interest (tap once = `neutral` / "I don't mind", tap again = `yes`, tap again = `no`, tap again = back to `neutral`). Members left untapped get **no interest record** — they will see the blue notification dot until they vote. This allows one person to record everyone's interest in one go without each person needing their own device.
7. All auto-filled fields remain editable before saving

**If a title is not found on TMDB**, the user can switch to a manual entry form with all fields blank.

For series, duration is the typical episode length (from TMDB's `episode_run_time`). `total_seasons` and `total_episodes` are required to enable watched auto-detection.

**Removing an entry:** any family member can delete a movie or series from the catalogue via a "Remove" option on the detail page (behind a confirmation prompt to prevent accidents). Deletion is permanent and removes all associated interests, comments, and series progress.

### 3. Detail Page

- Full poster image (top of page, larger than on the card)
- Full summary
- **Trailer link**: a tappable "Watch trailer" button that opens the YouTube trailer URL in a new tab. Only shown if a trailer URL exists.
- Metadata: duration, genre, platform, suggested by, TMDB source (for reference)
- Interest section: family members displayed grouped by interest state (`yes` first, then `neutral`, then `no`), each with their avatar, name, border ring colour, and watched checkmark
  - Tapping a member's avatar cycles their interest state: `neutral → yes → no → neutral`
  - "Mark as watched" toggle per family member, one tap, separate from interest
  - If every member has `watched = true`, the page shows an "All seen ✓" banner at the top
- **Comments section**: each family member's comment displayed with their avatar and name. Tapping your own comment (or an "Add comment" prompt if none yet) opens an inline edit field. Other members' comments are read-only.
- **Series tracker** (only shown if series has been started):
  - Each family member's current position displayed as "S1 E4" style
  - Increment episode with a single `+` tap (auto-advances season when appropriate)
  - Tap the "S1 E4" label to set position manually (for catching up)
  - Visual indicator showing who is ahead / behind / at the same point
  - A series is "started" when any family member logs progress for the first time
  - When a member's episode count reaches `total_episodes`, their row automatically shows a "Finished" badge and `watched` is set to true in `interests`
  - Members can also manually mark a series as watched (e.g. watched before using the app)

### 4. Movie Night Mode

Accessible from a prominent button on the home screen.

**Step 1 — Setup:**
- Select who is present (multi-select checkboxes of family members)
- Enter available time (input accepting formats like "2h", "90min", "1h30")

**Step 2 — Results:**

**Hard rule applied before any list:** any entry where at least one **present** member has `interest = 'no'` is excluded from Lists A and B entirely. It may appear in List C only as a last resort (see below).

The app generates up to two primary lists, and a fallback if both are empty:

#### List A — Perfect matches
All of the following must be true:
- No present member has `interest = 'no'`
- No present member has `watched = true`
- No absent member has `interest = 'yes'`
- Duration fits within available time (movie ≤ time; series: at least one episode fits)
- **Ranked by:** count of present members with `interest = 'yes'` (descending)

#### List B — Good but imperfect
No present member has `interest = 'no'`, but fails List A on one or more other criteria. Each entry shows every applicable reason tag:
- `"[Name] is away and wants to see this"`
- `"[Name] has already seen this"`
- `"Too long by 15 min"`

**Ranked by:** count of present members with `interest = 'yes'` (descending).

#### Fallback — shown only when both List A and List B are empty
Display an explicit message: *"No perfect match tonight — here are some alternatives."*

**List C1 — Too long, but watchable over two evenings**
Entries with no `no` votes from present members that would qualify for List A or B except for duration. Shown with a *"Could watch over 2 evenings"* label and how much time each part would take.

**List C2 — Someone doesn't want to watch (last resort)**
Entries excluded only because one or more present members said `no`. Shown below C1, clearly labelled as *"Not everyone is on board"*, with the dissenting member(s) named. Ranked by count of present `yes` votes.

Both primary lists and the fallback show: title, poster thumbnail, duration, interest breakdown for present members, and for series: how many episodes fit.

### 5. Settings / Family Management

- Add, rename, or remove family members
- Change avatar: opens the avatar picker (see Avatar System)

---

## UX Principles

- **Mobile-first**: design for 390px width (iPhone 14) as baseline
- **Large tap targets**: minimum 44x44px for all interactive elements
- **Speed**: the catalog and movie night mode are used repeatedly — they must feel instant
- **Clarity**: avatar images are used consistently throughout to represent family members at a glance — small circular thumbnails on cards, larger in the detail and settings pages
- **Identity is lightweight**: no accounts, no passwords. The active user is a localStorage selection, switchable at any time so a single device can be passed around the table.

---

## User Identity

There are no accounts or passwords. Identity is a localStorage value (`activeUserId`) that persists across sessions on the same device.

### On app open
Every time the app loads, a lightweight **"Who's watching?"** overlay is shown before the catalog:
- Displays all family member avatars in a grid with their names
- The previously active user (from localStorage) is pre-highlighted
- User taps their avatar to confirm or switch — one tap, then dismissed
- A "Skip / stay as [Name]" shortcut lets the same person dismiss without re-tapping

### Switching mid-session
A persistent **avatar button** in the top corner of every screen shows the current user's avatar. Tapping it reopens the "Who's watching?" overlay, allowing anyone to take over the device and update their own preferences.

### Implications
- Interest toggles, watched marks, comments, and series progress updates all write under the currently active user's ID
- One person can set interest on behalf of others during the Add flow (step 6) regardless of who the active user is, since that step explicitly shows all members

---

## TMDB Integration

All TMDB calls are made **server-side** (Next.js API routes) so the API key is never exposed to the client.

### Endpoints used

| Purpose | TMDB endpoint |
|---|---|
| Search movies | `GET /search/movie?query=…` |
| Search series | `GET /search/tv?query=…` |
| Movie detail (runtime, genres) | `GET /movie/{id}` |
| Series detail (seasons, episode count) | `GET /tv/{id}` |
| Videos (trailer) | `GET /movie/{id}/videos` or `GET /tv/{id}/videos` |

### Trailer selection logic
From the videos response, pick the first result where `type = "Trailer"` and `site = "YouTube"`. Construct the URL as `https://www.youtube.com/watch?v={key}`.

### Poster URL construction
`https://image.tmdb.org/t/p/w500{poster_path}` for cards. Use `w780` on the detail page.

### Data freshness
TMDB data is fetched once at entry creation and stored in the `media` table. It is not re-fetched automatically. The edit form allows manual correction if data is stale.

---

## Avatar System

Avatars are a curated set of 20 options covering emoji characters and DiceBear illustrated faces. No external dependency at runtime — all assets are bundled in `/public/avatars/`. Every family member can find something that feels like them.

### The 20 avatars

#### Emoji — animals & fantasy
Stored as SVG files wrapping the emoji in a styled circle with a soft background colour.

| Key | Emoji | Name | Background |
|---|---|---|---|
| `fox` | 🦊 | Fox | `#fff3e0` |
| `wolf` | 🐺 | Wolf | `#e8f0ff` |
| `dragon` | 🐉 | Dragon | `#f0f8ff` |
| `unicorn` | 🦄 | Unicorn | `#fdf0ff` |
| `fish` | 🐠 | Fish | `#e0f4ff` |
| `owl` | 🦉 | Owl | `#1e2a1e` |
| `elf` | 🧝‍♀️ | Elf | `#d4f0c8` |

#### Emoji — adventure & royalty
| Key | Emoji | Name | Background |
|---|---|---|---|
| `astronaut` | 🧑‍🚀 | Astronaut | `#e0eeff` |
| `princess` | 👸 | Princess | `#fff0f8` |

#### DiceBear illustrated faces — `adventurer` style
Generated once at build time using fixed seeds, saved as static SVGs in `/public/avatars/`. Background colours are baked in at generation time.

| Key | DiceBear seed | Background |
|---|---|---|
| `braids` | `girl-braids` | `#ffb8d4` |
| `curls` | `girl-curls` | `#ffcce0` |
| `ponytail` | `Luna` | `#e8b4ff` |
| `cap` | `boy-cap` | `#b8e8ff` |
| `headphones` | `boy-headphones` | `#c8f0ff` |
| `fringe` | `Max` | `#b8f0c8` |
| `cat-face` | `cosy-cat` | `#ffeab8` |
| `fox-face` | `fox` | `#ffd5b8` |
| `astronaut-face` | `astronaut` | `#b8d4ff` |
| `wizard-face` | `wizard` | `#d8b8ff` |
| `robot-face` | `robot-retro` | `#e0e0e0` |

### Generation command (run once at build, not at runtime)
```
https://api.dicebear.com/9.x/adventurer/svg?seed={seed}&backgroundColor={colour}
```

### Avatar picker UI

- Displayed as a scrollable grid of circular thumbnails, grouped by style (emoji / illustrated)
- Currently selected avatar has a highlighted border ring
- Shown when creating or editing a family member
- Also accessible from the member's profile in Settings

---

## App Routes

| Route | Purpose |
|---|---|
| `/` | Catalog — list all media |
| `/add` | Add new movie or series |
| `/media/[id]` | Detail page + interest toggles + series tracker |
| `/media/[id]/edit` | Edit media entry |
| `/movie-night` | Movie night mode (attendees + time → suggestions) |
| `/settings` | Manage family members |

---

## PWA Requirements

- `manifest.json` with app name, icons, `display: standalone`, `theme_color`
- Service worker for basic offline shell caching (catalog may not work offline since data is in Supabase, but the app should not show a blank screen)
- iOS: ensure `apple-touch-icon` meta tags are present so "Add to Home Screen" shows a proper icon
- Android: Chrome install prompt should work via the manifest

---

## Supabase Setup Notes

- Enable Row Level Security (RLS) on all tables but keep policies open (no auth) since the app has no login — all family members share access
- Use Supabase Realtime on the `interests`, `series_progress`, and `comments` tables so that updates from one family member's device appear on others without a page refresh

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TMDB_API_KEY=
```

---

## Dark Mode

The app fully supports dark mode using Tailwind CSS `dark:` variants responding to the device's `prefers-color-scheme: dark` media query. All pages and components apply dark backgrounds and light text automatically — no manual toggle is required.

---

## User Identity — Header Dropdown

Tapping the avatar button in the header opens a dropdown menu with four options:
- **Change user** — reopens the "Who's watching?" overlay
- **Catalogue** — navigates to the home screen (`/`)
- **Movie Night** — navigates to `/movie-night`
- **Settings** — navigates to `/settings`

After selecting a different user via the overlay, the app navigates to the catalogue home page.

---

## Notification Dot (Unvoted Movies)

A small **blue** dot badge appears on a family member's avatar in the "Who's watching?" overlay and on the active user's avatar in the header when there are movies they have **no interest record for at all** (i.e. they have never voted, not even neutral).

**Implementation:**
- Dot logic: `media.some(m => !interests.find(i => i.family_member_id === userId && i.media_id === m.id))`
- No timestamps or localStorage required — purely derived from the presence/absence of interest records
- The header dot clears live via a Supabase Realtime subscription on `interests` as the user votes
- Voting neutral explicitly sets a record and clears the dot — neutral means "I don't mind", not "no opinion yet"
- No new database table required

---

## Out of Scope (for now)

- User authentication / individual accounts
- Push notifications
- Offline data sync
- Re-fetching or syncing TMDB data after initial entry creation
