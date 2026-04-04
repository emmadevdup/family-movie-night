# Coding Practices — Plain Language

*Maintained in parallel with CODING-PRACTICES.md. When a rule changes, update both files.*

---

## Keep it simple
Write the minimum code that solves the problem. Don't build for hypothetical future needs, don't add safety nets for things that can't go wrong, and don't leave explanatory comments unless the logic is genuinely hard to follow.

## TypeScript strictly
No shortcuts, no loose types, no casting to silence errors. Database types are generated automatically from Supabase — never written by hand.

## Server first
In Next.js, components run on the server by default. Only switch to client-side when you actually need browser features or interactivity. The TMDB API key never touches the browser — all TMDB calls go through server-side routes.

## Business logic is isolated
The movie night algorithm lives in one pure function with no database calls inside it. This makes it simple to test exhaustively without needing a running server or database.

## Tailwind only, mobile first
No other CSS approaches. Base styles target a phone screen; bigger screens are handled after.

## Security basics
API keys stay server-side. All user text is sanitised before hitting the database. Always use Supabase's query builder — no raw SQL strings ever.

## Testing is not optional
Failing tests get fixed, not skipped. Unit tests live next to the code they test. E2E tests live in `/e2e`.

## Clean git
Small focused commits, short imperative messages ("add movie night algorithm"), no `.env` files ever committed.
