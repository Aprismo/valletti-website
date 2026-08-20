# Valletti Website — Project Memory

Read `../CLAUDE.md` first — it has the full project context.

## Critical rule — repeated here for emphasis

**This codebase must stay 100% separate from Aprisom.com and
Aprismo.io.** No shared repo, Supabase project, Vercel project, domain,
env vars, or email-sending config. Set up everything for Valletti
fresh and independent. If unsure, ask Niels before connecting this
project to any shared infrastructure.

## Quick facts

- Next.js App Router + Tailwind, next-intl for EN/NL/DE/FR/IT.
- Public pages under `app/[locale]/`; admin panel under `app/admin/`
  (intentionally outside the locale tree — English-only, single user).
- Placeholder data lives in `/data` (wines, retailers, closures) and
  `/lib/admin-store.tsx` (in-memory admin state) — both are meant to be
  swapped for real Supabase queries. Schema is in `/supabase/schema.sql`.
- Real wine bottle photos are in `public/wines/`; logo in `public/brand/`.
- See `README.md` for local dev and the production checklist.
