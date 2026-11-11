/**
 * True when the Supabase env vars are set (see .env.example). When they
 * aren't, the site runs on the placeholder data in /data and the admin
 * panel keeps changes in the browser only — handy for local development.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
