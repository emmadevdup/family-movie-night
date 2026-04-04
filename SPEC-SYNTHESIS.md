# Family Movie Night App — Spec Synthesis

*Summary of all design decisions made during the planning discussion. The authoritative technical spec is in CLAUDE.md.*

---

## Project files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Full technical spec — the authoritative reference for building |
| `SPEC-SYNTHESIS.md` | Narrative summary of all decisions (this file) |
| `TASKS.md` | Detailed phased build checklist with checkboxes |
| `TASKS-PLAIN.md` | Same in plain language — maintain in parallel with TASKS.md |
| `TESTING.md` | Test strategy, unit test checklist, E2E technical flows |
| `E2E-USE-CASES.md` | Plain-language user journeys — maintain in parallel with TESTING.md |
| `CODING-PRACTICES.md` | Technical coding rules that apply to every file |
| `CODING-PRACTICES-PLAIN.md` | Same in plain language — maintain in parallel with CODING-PRACTICES.md |

---

## What the app does

A Progressive Web App for family use. It maintains a shared catalogue of movies and series that anyone in the family can suggest. Each person can express interest, leave a comment, and track what they've watched. On movie night, the app takes who is present and how much time is available, and produces ranked suggestions.

---

## Tech stack decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Full-stack in one project, easy Vercel deployment |
| Database | Supabase (PostgreSQL) | Free tier, Realtime sync, no server to manage |
| Hosting | Vercel | Free tier, permanent shareable link |
| Styling | Tailwind CSS | Utility-first, good for mobile-first |
| PWA | next-pwa or custom service worker | Installable on iOS and Android via "Add to Home Screen" |
| External API | TMDB (server-side only) | Auto-fills poster, summary, trailer, duration, genre |

The app is accessible via a link and installable as a home screen app — no App Store involved. This gives 90% of the "native app feel" with much less complexity.

---

## Key feature decisions

### Catalogue
- Cards show: poster (from TMDB), title, type, duration, platform, genre, truncated summary, who suggested it, avatar row, speech bubble if comments exist
- Entries watched by everyone are heavily dimmed with an "All seen ✓" banner on the poster
- Entries watched only by the current user are slightly dimmed

### Interest system (3 states)
- `yes` — actively wants to watch (green border ring, counts toward ranking score)
- `neutral` — no opinion, treated as willing (grey border ring, does not disqualify)
- `no` — explicitly does not want to watch (red border ring, exclusion from Lists A & B)
- Toggled by tapping your own avatar: cycles `neutral → yes → no → neutral`
- Avatars on each card are **grouped**: yes first, then neutral, then no

### Watched tracking
- Movies: manual toggle per family member
- Series: auto-set when episode progress reaches `total_episodes`; manual override available
- "All seen" state triggers visual treatment on card and detail page

### Comments
- One comment per family member per entry, editable
- Visible on the detail page; speech bubble icon on card if any exist
- Real-time sync via Supabase Realtime

### Series tracker
- Only shown once any family member has logged progress
- Position shown as "S1 E4"; one-tap `+` to advance episode
- Auto-advances season; auto-marks watched when finished
- Visual indicator of who is ahead / behind / caught up

### Adding an entry
- TMDB search flow: type title → pick result → metadata auto-fills
- Manual fallback if not found on TMDB
- Inline interest step: one person can tap all family avatars to set everyone's interest at once (no need for individual phones)
- Any member can remove an entry (confirmation required); deletion cascades to all related data

### Movie night mode

**Input:** who is present + available time

**Hard rule:** any entry where a present member has `interest = 'no'` is excluded from ALL lists.

**List A — Perfect matches** (all must be true):
- No present member said `no`
- No present member has already watched it
- No absent member has `interest = 'yes'`
- Fits within available time
- Ranked by count of present `yes` votes

**List B — Imperfect matches** (no `no` from present, but fails on other criteria):
- Absent member wants to see it
- Someone present has already watched it
- Too long
- Ranked same as List A
- Each entry shows human-readable reason tags

**Fallback (List C) — only shown if A and B are both empty:**
- Explicit "no perfect match" message
- C1: too long but no `no` votes — labelled "Could watch over 2 evenings"
- C2: entries with at least one present `no` vote — labelled "Not everyone is on board", ranked by `yes` count

### User identity
- No accounts or passwords
- "Who's watching?" overlay on every app open — pre-selects last user, one tap to confirm or switch
- Persistent avatar button in top corner to switch mid-session
- Active user stored in localStorage
- One person can update preferences for all during the add flow

---

## Avatar system

17 options in two styles:

**Emoji (in styled circles):** Fox 🦊 · Wolf 🐺 · Dragon 🐉 · Unicorn 🦄 · Fish 🐠 · Owl 🦉 · Elf 🧝‍♀️ · Astronaut 🧑‍🚀 · Princess 👸

**DiceBear `adventurer` illustrated faces** (generated once, bundled as static SVGs):
Braids · Curls · Ponytail · Cap · Headphones · Fringe · Cat face · Fox face · Astronaut face · Wizard face · Robot face

Avatar display uses **coloured border rings** (green / grey / red) to indicate interest state. Avatars are grouped on cards (yes → neutral → no).

---

## Things explicitly out of scope

- User authentication / individual accounts
- Push notifications
- Offline data sync (app shell cached, but data requires connectivity)
- Re-fetching TMDB data after initial entry creation
- App Store / Play Store distribution (PWA only)
