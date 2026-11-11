# Valletti — website prototype

A working prototype for the Azienda Agricola Valletti website: public
site in 5 languages (EN/NL/DE/FR/IT) plus an admin panel for Roberto.
Built with Next.js (App Router), Tailwind CSS, next-intl, and designed
to run on Vercel with Supabase as the backend.

## How it works

- **Public pages** (Home, The Winery, About, Wines, Visit, Where to Buy)
  are fully built and localized. Content (wines, retailers, closure
  periods, pictures, page content, design profile) is loaded on the
  server in `lib/data.ts`: from **Supabase** when it's configured,
  otherwise from the placeholder files in `/data` (local development).
- **The Visit form** posts to `app/api/contact/route.ts`, which emails
  the request via **Resend** to `CONTACT_NOTIFY_EMAIL` (reply-to is the
  visitor). Without Resend configured it only logs locally, and returns
  an error in production.
- **The `/admin` panel** is protected by **Supabase Auth** (email +
  password): `proxy.ts` sends anyone not signed in to `/admin/login`.
  Changes are saved to Supabase and pictures uploaded to the `media`
  storage bucket; row-level security (`supabase/schema.sql`) means only
  signed-in users can write. Without Supabase, the admin runs in local
  mode (changes stay in your browser, uploads go to `/public/uploads`)
  — and is locked in production builds, so a deploy with missing env
  vars never exposes an open admin.
- **`/admin/design`** (Design & Branding) lets Roberto set the site's
  name, logo, colors, fonts, and address — the Visit page's map and
  contact info are built directly from that address, in every language.
- **Page Content** (`/admin/pages`): pictures, the Opening Hours text,
  and the Home / The Winery / About texts are saved to Supabase. Page
  texts are stored per language (`page_content` key
  `<locale>:<page>.<field>`, fields listed in `data/page-fields.ts`);
  anything not saved falls back to the translations in `/messages`.
  Opening Hours is still one English text shown in every language.

## Running it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` (redirects to `/en`) and
`http://localhost:3000/admin`. With no `.env.local`, everything runs on
the `/data` placeholders. To work against a real Supabase project,
copy `.env.example` to `.env.local` and fill it in.

## Environment variables

Set these on Vercel (Production). See `.env.example` for details.

| Name | Required | What |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon / publishable key (never the service_role key) |
| `RESEND_API_KEY` | yes | Resend API key |
| `CONTACT_NOTIFY_EMAIL` | yes | Inbox for visit requests / questions (comma-separated for several) |
| `CONTACT_FROM_EMAIL` | yes | Sender on a domain verified in Resend |

## Going to production

Step-by-step checklist: **[GO-LIVE.md](GO-LIVE.md)**. In short:

1. Create a Supabase project, run `supabase/schema.sql` then
   `supabase/seed.sql` in the SQL editor (creates tables, RLS, the
   `media` bucket, and loads the current wines/pictures/design).
2. Turn off public sign-ups and create Roberto's admin user.
3. Verify Roberto's domain in Resend and create an API key.
4. Deploy to Vercel with the env vars above and connect the domain.

All accounts (Supabase, Vercel, Resend, domain) are Roberto's own and
kept fully separate from any other project.

See the full specification document for more detail on scope, content
model, and what's intentionally out of scope for v1.
