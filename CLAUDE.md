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
- Content is loaded server-side in `/lib/data.ts` from Supabase, falling
  back to the placeholder data in `/data` when the Supabase env vars are
  missing. Admin writes go through `/lib/admin-store.tsx`. Schema and
  starting content: `/supabase/schema.sql` + `/supabase/seed.sql`.
- `/admin` is protected by Supabase Auth in `proxy.ts`. Go-live steps:
  `GO-LIVE.md`.
- Real wine bottle photos are in `public/wines/`; logo in `public/brand/`.
- See `README.md` for local dev and the production checklist.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
