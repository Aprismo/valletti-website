-- Valletti website — Supabase schema
-- Run this ONCE in the Supabase SQL editor on a new, empty project,
-- then run seed.sql to load the starting content. See GO-LIVE.md.
--
-- Columns are snake_case versions of the TypeScript fields in
-- types/index.ts (image_media_id <-> imageMediaId); lib/db-mapping.ts
-- converts between them. Ids are text so the seeded ids from /data
-- ("1", "media-1", ...) and new random UUIDs can live side by side.

-- ── Wines ────────────────────────────────────────────────────────────
create table wines (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  name text not null,
  type text not null default 'red' check (type in ('red','white','rose','sparkling')),
  grape_variety text not null default '',
  vineyard_name text not null default '',
  vineyard_description text not null default '',
  plot_size text not null default '',
  grape_description text not null default '',
  altitude text,
  training_system text,
  cultivation_method text,
  harvest_period text,
  grape_yield text,
  vineyard_parcels jsonb,          -- [{ exposure, soil, averageAge }]
  unfiltered boolean,
  fermentation text not null default '',
  maceration text not null default '',
  aging_vessel text not null default 'steel' check (aging_vessel in ('steel','barrel')),
  barrel_size text,
  aging_notes text not null default '',
  experience_description text not null default '',
  pairing_text text not null default '',
  abv text not null default '',
  serving_temp text not null default '',
  image_url text not null default '',
  image_media_id text not null default '',  -- media_items.id of the bottle picture
  featured boolean not null default false,
  sort_order int not null default 1000,
  created_at timestamptz not null default now()
);

-- ── Media library ────────────────────────────────────────────────────
-- Pictures shown in the admin's Media Library. Uploaded pictures live in
-- the `media` storage bucket (storage_path set); pictures that ship with
-- the site under /public have only a url.
create table media_items (
  id text primary key default gen_random_uuid()::text,
  url text not null,
  file_name text not null default '',
  storage_path text,
  uploaded_at timestamptz not null default now()
);

-- ── Page content (Page Content screen in admin) ──────────────────────
-- kind 'image': key = page section (e.g. 'home.heroBackground'), value = media_items.id
-- kind 'text':  key = text key (e.g. 'visit.openingHoursText'), value = the text
create table page_content (
  key text primary key,
  kind text not null check (kind in ('image','text')),
  value text not null default ''
);

-- ── Retailers ("Where to Buy") ─────────────────────────────────────────
create table retailers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text not null default 'shop' check (type in ('shop','restaurant','importer')),
  region text not null default '',
  country text not null default '',
  website text,
  address text,
  sort_order int not null default 1000
);

-- ── Closure periods (visit availability banner) ─────────────────────────
create table closure_periods (
  id text primary key default gen_random_uuid()::text,
  start_date date not null,
  end_date date not null,
  note text,
  active boolean not null default true
);

-- ── Visit / contact requests ─────────────────────────────────────────
-- Not used by the code yet (the form emails via Resend); kept so a
-- history can be added later without a schema change.
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('visit','question')),
  name text not null,
  email text not null,
  phone text,
  preferred_date date,
  guests int,
  message text,
  locale text,
  created_at timestamptz default now()
);

-- ── Design profile (site_settings) ──────────────────────────────────
-- Singleton table: exactly one row (id = 1). Name, logo, palette, fonts
-- and address live here instead of being hardcoded. Edited from
-- /admin/design.
create table site_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Valletti',
  legal_name text not null default 'Azienda Agricola Valletti',
  tagline text not null default '',
  logo_url text,                -- empty = /brand/logo.jpeg
  color_primary text not null default '#5c1a2b',
  color_primary_dark text not null default '#3a0f1c',
  color_accent text not null default '#b98b3e',
  color_background text not null default '#f6f0e6',
  color_background_alt text not null default '#ece2d0',
  color_text text not null default '#2a2320',
  color_highlight text not null default '#a8583a',
  heading_font text not null default 'cormorant', -- id from lib/fonts.ts HEADING_FONTS
  body_font text not null default 'inter',        -- id from lib/fonts.ts BODY_FONTS
  address_line1 text not null default '',
  address_line2 text not null default '',
  address_line3 text not null default '',
  phone text not null default ''
);

insert into site_settings (id) values (1);

-- ── Admin users ──────────────────────────────────────────────────────
-- Handled by Supabase Auth (auth.users). Create Roberto's user by hand
-- and TURN OFF public sign-ups (see GO-LIVE.md) — every signed-in user
-- can edit the site.

-- ── Row Level Security ───────────────────────────────────────────────
-- Public (anon) can READ site content. Only signed-in users can write.
-- Inquiries: anon can INSERT only, never read.

alter table wines enable row level security;
alter table media_items enable row level security;
alter table page_content enable row level security;
alter table retailers enable row level security;
alter table closure_periods enable row level security;
alter table inquiries enable row level security;
alter table site_settings enable row level security;

create policy "public read wines" on wines for select using (true);
create policy "public read media_items" on media_items for select using (true);
create policy "public read page_content" on page_content for select using (true);
create policy "public read retailers" on retailers for select using (true);
create policy "public read closure_periods" on closure_periods for select using (true);
create policy "public read site_settings" on site_settings for select using (true);

create policy "admin write wines" on wines for all to authenticated using (true) with check (true);
create policy "admin write media_items" on media_items for all to authenticated using (true) with check (true);
create policy "admin write page_content" on page_content for all to authenticated using (true) with check (true);
create policy "admin write retailers" on retailers for all to authenticated using (true) with check (true);
create policy "admin write closure_periods" on closure_periods for all to authenticated using (true) with check (true);
create policy "admin write site_settings" on site_settings for update to authenticated using (true) with check (true);

create policy "public submit inquiries" on inquiries for insert with check (true);
create policy "admin read inquiries" on inquiries for select to authenticated using (true);

-- ── Storage bucket for the picture library ──────────────────────────
-- Public read (pictures are shown on the public site); only signed-in
-- users can upload, replace or delete.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
-- Deleting a file through the API also needs select permission.
create policy "admin read media" on storage.objects
  for select to authenticated using (bucket_id = 'media');
