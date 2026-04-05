# Build Task List — Plain Language

*Maintained in parallel with TASKS.md. When a phase changes, update both files.*

---

The work is split into 16 phases, each building on the last.

## Phase 1 — Foundation
Create the Next.js project, connect Supabase and Vercel, confirm a live URL exists before writing any features.

## Phase 2 — Database
Create all five tables (family members, media, interests, series progress, comments), set up security, and enable live sync between devices.

## Phase 3 — Avatars
Generate and bundle all 17 avatar image files. Build the reusable avatar component that shows the coloured border ring for interest state.

## Phase 4 — User identity
Build the "Who's watching?" overlay that appears on every app open, and the ability to switch user at any point mid-session.

## Phase 5 — Settings
Allow adding, editing, and removing family members, and changing their avatar.

## Phase 6 — TMDB integration
Build the server-side routes that search for movies and series and fetch their full details (poster, summary, trailer, duration). The API key never reaches the browser.

## Phase 7 — Add / Edit media
The full three-step flow for adding an entry: search TMDB, review and adjust the auto-filled info, then set everyone's interest in one go.

## Phase 8 — Catalogue
The home screen: cards with posters, interest avatars grouped and colour-ringed, quick interest toggle, dimming for watched entries, and filters.

## Phase 9 — Detail page
Full poster, complete summary, trailer button, interest section with all family members, comments, and live updates when someone else changes something.

## Phase 10 — Watched tracking
Manual "mark as watched" toggle for movies. Automatic detection for series when someone finishes the last episode.

## Phase 11 — Series tracker
Episode progress per person displayed as "S1 E4", one-tap advance, automatic season progression, and a visual indicator of who is ahead or behind.

## Phase 12 — Movie night mode
The suggestion algorithm and the full results screen: List A (perfect), List B (imperfect with reasons), and the List C fallback with "too long" and "someone said no" sub-lists.

## Phase 13 — Remove entry
Delete a movie or series from the catalogue with a confirmation step. All associated data (interests, comments, progress) is removed too.

## Phase 14 — PWA
Make the app installable on iOS and Android home screens so it feels like a native app.

## Phase 15 — Polish and QA
Check everything on a real phone screen, verify all buttons are easy to tap, confirm live sync works across two devices, run all tests.

## Phase 16 — Deployment
Set production credentials, do the final deploy, and share the link with the family.

## Phase 17 — Improvements and new features (post-launch)
A batch of quality-of-life improvements: full dark mode adapting to the phone's night setting, app renamed to "Super Famille Movies", a dropdown menu behind the avatar button, genre filter and sort order in the catalogue, cast and release year on detail pages, automatic platform detection from TMDB, and a notification dot that tells each family member when new entries have been added since they last opened the app.
