import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client, for use inside the /admin panel (client
 * components) once a real Supabase project is connected. Requires
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set —
 * see .env.example. Not called anywhere in the public prototype pages,
 * which use the placeholder data in /data instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
