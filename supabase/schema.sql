-- ============================================================
-- Family Movie Night — full schema
-- Run this once in the Supabase SQL editor
-- ============================================================

-- ── Enum types ───────────────────────────────────────────────

create type media_type as enum ('movie', 'series');
create type interest_state as enum ('yes', 'no', 'neutral');

-- ── Tables ───────────────────────────────────────────────────

create table family_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  avatar_id   text not null,
  created_at  timestamptz not null default now()
);

create table media (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  type              media_type not null,
  duration_minutes  integer,
  suggested_by      uuid references family_members(id) on delete set null,
  platform          text,
  genre             text,
  notes             text,
  total_seasons     integer,
  total_episodes    integer,
  tmdb_id           integer,
  poster_url        text,
  summary           text,
  trailer_url       text,
  cast              text,
  release_year      integer,
  created_at        timestamptz not null default now()
);

create table interests (
  id                uuid primary key default gen_random_uuid(),
  media_id          uuid not null references media(id) on delete cascade,
  family_member_id  uuid not null references family_members(id) on delete cascade,
  interest          interest_state not null default 'neutral',
  watched           boolean not null default false,
  created_at        timestamptz not null default now(),
  unique (media_id, family_member_id)
);

create table series_progress (
  id                uuid primary key default gen_random_uuid(),
  media_id          uuid not null references media(id) on delete cascade,
  family_member_id  uuid not null references family_members(id) on delete cascade,
  season            integer not null default 1,
  episode           integer not null default 0,
  updated_at        timestamptz not null default now(),
  unique (media_id, family_member_id)
);

create table comments (
  id                uuid primary key default gen_random_uuid(),
  media_id          uuid not null references media(id) on delete cascade,
  family_member_id  uuid not null references family_members(id) on delete cascade,
  body              text not null,
  updated_at        timestamptz not null default now(),
  unique (media_id, family_member_id)
);

-- ── Row Level Security ────────────────────────────────────────
-- RLS enabled on all tables; policies are fully open since there
-- is no auth — all family members share access via the anon key.

alter table family_members   enable row level security;
alter table media             enable row level security;
alter table interests         enable row level security;
alter table series_progress   enable row level security;
alter table comments          enable row level security;

create policy "open access" on family_members   for all using (true) with check (true);
create policy "open access" on media             for all using (true) with check (true);
create policy "open access" on interests         for all using (true) with check (true);
create policy "open access" on series_progress   for all using (true) with check (true);
create policy "open access" on comments          for all using (true) with check (true);

-- ── Realtime ─────────────────────────────────────────────────
-- Enable live updates on the three tables that change frequently.

alter publication supabase_realtime add table interests;
alter publication supabase_realtime add table series_progress;
alter publication supabase_realtime add table comments;
