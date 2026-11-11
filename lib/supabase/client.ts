import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client, used by the admin panel (lib/admin-store.tsx
 * and the login page) to sign in, save changes and upload pictures.
 * Only call this when isSupabaseConfigured is true (lib/supabase/config.ts).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
