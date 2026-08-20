# Valletti — website prototype

A working prototype for the Azienda Agricola Valletti website: public
site in 5 languages (EN/NL/DE/FR/IT) plus an admin panel for Roberto.
Built with Next.js (App Router), Tailwind CSS, next-intl, and designed
to run on Vercel with Supabase as the backend.

## What's real vs. what's a mockup

- **Public pages** (Home, The Winery, About, Wines, Visit, Where to Buy)
  are fully built and localized. Wine/retailer/closure data currently
  comes from placeholder files in `/data` — swap these for Supabase
  queries once a project is connected (see below).
- **The Visit form** actually submits to `/app/api/contact/route.ts`,
  which validates and logs the request. Wire in an email provider
  (Resend, Postmark…) there to notify Roberto for real.
- **The `/admin` panel** is fully clickable (add/edit/remove wines,
  upload/delete pictures, manage retailers and closure periods) but
  runs on in-memory state (`/lib/admin-store.tsx`) — changes reset on
  reload. This is intentional: it lets you and Roberto react to the
  actual UX before wiring up real auth and a database.

## Running it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` (redirects to `/en`) and
`http://localhost:3000/admin`.

## Going to production

1. **Create a Supabase project.** Run `/supabase/schema.sql` in the SQL
   editor — it creates the wines, translations, retailers, closures,
   media, and inquiries tables, with row-level security so the public
   can only read (and submit inquiries), and only a signed-in admin can
   write.
2. **Create a `media` storage bucket** in Supabase (public read).
3. **Copy `.env.example` to `.env.local`** and fill in your Supabase
   URL and anon key.
4. **Swap the `/data` placeholder functions** for real Supabase queries
   (the shapes already match the schema — `getWineBySlug`,
   `getFeaturedWines`, etc.).
5. **Wire up Supabase Auth** on `/admin` (currently unprotected) so only
   Roberto can sign in — a single email/password user is enough to
   start.
6. **Add an email provider** in `/app/api/contact/route.ts` so visit
   requests actually reach Roberto's inbox.
7. **Deploy to Vercel**, add the env vars there, connect the domain.

See the full specification document for more detail on scope, content
model, and what's intentionally out of scope for v1.
