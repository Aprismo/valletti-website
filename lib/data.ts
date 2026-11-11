import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fromRow } from "@/lib/db-mapping";
import { seedSiteData } from "@/data/seed";
import { AdminWine, ClosurePeriod, MediaItem, Retailer, SiteData, SiteSettings, Wine } from "@/types";

/**
 * Loads all site content on the server — wines, pictures, retailers,
 * closures, page content and the design profile.
 *
 * - With Supabase configured: reads from the database (public, read-only
 *   anon access — see the RLS policies in supabase/schema.sql).
 * - Without Supabase (local dev): returns the placeholder data in /data.
 *
 * If a single table can't be read (e.g. schema.sql hasn't been run yet),
 * that part falls back to /data and the error is logged, so the site
 * keeps working instead of crashing.
 *
 * Wrapped in React cache() so it runs at most once per request, no matter
 * how many components ask for it.
 */
export const getSiteData = cache(async (): Promise<SiteData> => {
  const fallback = seedSiteData();
  if (!isSupabaseConfigured) return fallback;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const [wines, media, retailers, closures, pageContent, settings] = await Promise.all([
    supabase.from("wines").select("*").order("sort_order").order("created_at"),
    supabase.from("media_items").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("retailers").select("*").order("sort_order").order("name"),
    supabase.from("closure_periods").select("*").order("start_date"),
    supabase.from("page_content").select("*"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  function rows<T>(name: string, res: { data: unknown; error: { message: string } | null }, fb: T[]): T[] {
    if (res.error || !Array.isArray(res.data)) {
      console.error(`Supabase: could not read ${name}, using /data fallback:`, res.error?.message);
      return fb;
    }
    return res.data.map((r) => fromRow<T>(r as Record<string, unknown>));
  }

  const contentRows = rows<{ key: string; kind: "image" | "text"; value: string }>(
    "page_content",
    pageContent,
    []
  );
  const pageImages = pageContent.error ? fallback.pageImages : {};
  const pageText = { ...fallback.pageText };
  for (const row of contentRows) {
    if (row.kind === "image") pageImages[row.key] = row.value;
    else pageText[row.key] = row.value;
  }

  let siteSettings: SiteSettings = fallback.siteSettings;
  if (settings.error) {
    console.error("Supabase: could not read site_settings, using /data fallback:", settings.error.message);
  } else if (settings.data) {
    siteSettings = { ...fallback.siteSettings, ...fromRow<Partial<SiteSettings>>(settings.data) };
  }

  return {
    wines: rows<AdminWine>("wines", wines, fallback.wines),
    media: rows<MediaItem>("media_items", media, fallback.media),
    retailers: rows<Retailer>("retailers", retailers, fallback.retailers),
    closures: rows<ClosurePeriod>("closure_periods", closures, fallback.closures),
    pageImages,
    pageText,
    siteSettings,
  };
});

export async function getWines(): Promise<Wine[]> {
  return (await getSiteData()).wines;
}

export async function getWineBySlug(slug: string): Promise<Wine | undefined> {
  return (await getWines()).find((w) => w.slug === slug);
}

export async function getRetailers(): Promise<Retailer[]> {
  return (await getSiteData()).retailers;
}

export async function getClosures(): Promise<ClosurePeriod[]> {
  return (await getSiteData()).closures;
}
