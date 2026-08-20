-- Valletti website — Supabase schema
-- Run this in the Supabase SQL editor on a new project.
-- Languages supported throughout: en, nl, de, fr, it

-- ── Wines ────────────────────────────────────────────────────────────
create table wines (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  vintage text,
  abv text,
  serving_temp text,
  image_url text,               -- points to a file in the `media` storage bucket
  gallery_urls text[] default '{}',
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One row per wine per language. This is what Roberto edits per-language
-- in the admin panel.
create table wine_translations (
  id uuid primary key default gen_random_uuid(),
  wine_id uuid references wines(id) on delete cascade,
  locale text not null check (locale in ('en','nl','de','fr','it')),
  name text not null,
  grape_variety text,
  vineyard_name text,
  vineyard_description text,
  grape_description text,
  experience_description text,
  pairing_text text,
  unique (wine_id, locale)
);

-- ── Editable page sections (Home / The Winery / About) ─────────────────
create table page_sections (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page in ('home','winery','about')),
  section_key text not null,     -- e.g. 'philosophy', 'history', 'today'
  sort_order int default 0,
  image_url text,
  created_at timestamptz default now(),
  unique (page, section_key)
);

create table page_section_translations (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references page_sections(id) on delete cascade,
  locale text not null check (locale in ('en','nl','de','fr','it')),
  title text,
  body text,
  unique (section_id, locale)
);

-- ── Retailers ("Where to Buy") ─────────────────────────────────────────
create table retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('shop','restaurant','importer')),
  region text,
  country text,
  website text,
  address text,
  sort_order int default 0
);

-- ── Closure periods (visit availability banner) ─────────────────────────
create table closure_periods (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  note text,
  active boolean default true
);

create table closure_period_translations (
  id uuid primary key default gen_random_uuid(),
  closure_id uuid references closure_periods(id) on delete cascade,
  locale text not null check (locale in ('en','nl','de','fr','it')),
  note text,
  unique (closure_id, locale)
);

-- ── Media library ────────────────────────────────────────────────────
-- Metadata for files uploaded to the `media` Storage bucket, so the
-- admin panel can show a searchable picture library independent of
-- which wine/page currently uses each image.
create table media_items (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,   -- path within the `media` bucket
  file_name text,
  alt_text text,
  uploaded_at timestamptz default now()
);

-- ── Visit / contact requests (logged for reference; notification is via email) ──
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

-- ── Admin users ──────────────────────────────────────────────────────
-- Handled by Supabase Auth (auth.users). No extra table needed for a
-- single admin (Roberto); add a `profiles` table with a `role` column
-- later if more staff need logins.

-- ── Row Level Security ───────────────────────────────────────────────
-- Public (anon) can READ wines/translations/sections/retailers/closures.
-- Only authenticated admin users can write. Inquiries: anon can INSERT
-- only (the contact form), never read.

alter table wines enable row level security;
alter table wine_translations enable row level security;
alter table page_sections enable row level security;
alter table page_section_translations enable row level security;
alter table retailers enable row level security;
alter table closure_periods enable row level security;
alter table closure_period_translations enable row level security;
alter table media_items enable row level security;
alter table inquiries enable row level security;

create policy "public read wines" on wines for select using (true);
create policy "public read wine_translations" on wine_translations for select using (true);
create policy "public read page_sections" on page_sections for select using (true);
create policy "public read page_section_translations" on page_section_translations for select using (true);
create policy "public read retailers" on retailers for select using (true);
create policy "public read closure_periods" on closure_periods for select using (true);
create policy "public read closure_period_translations" on closure_period_translations for select using (true);

create policy "admin write wines" on wines for all using (auth.role() = 'authenticated');
create policy "admin write wine_translations" on wine_translations for all using (auth.role() = 'authenticated');
create policy "admin write page_sections" on page_sections for all using (auth.role() = 'authenticated');
create policy "admin write page_section_translations" on page_section_translations for all using (auth.role() = 'authenticated');
create policy "admin write retailers" on retailers for all using (auth.role() = 'authenticated');
create policy "admin write closure_periods" on closure_periods for all using (auth.role() = 'authenticated');
create policy "admin write closure_period_translations" on closure_period_translations for all using (auth.role() = 'authenticated');
create policy "admin manage media_items" on media_items for all using (auth.role() = 'authenticated');

create policy "public submit inquiries" on inquiries for insert with check (true);
create policy "admin read inquiries" on inquiries for select using (auth.role() = 'authenticated');

-- ── Storage bucket for the picture library ──────────────────────────
-- Create manually in Supabase Studio → Storage, or via:
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);
