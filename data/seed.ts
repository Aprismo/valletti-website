import { AdminWine, MediaItem, SiteData } from "@/types";
import { wines } from "./wines";
import { retailers } from "./retailers";
import { closures } from "./closures";
import { DEFAULT_SITE_SETTINGS } from "./site-settings";
import en from "@/messages/en.json";
import {
  EDITABLE_PAGES,
  PAGE_TEXT_FIELDS,
  TEXT_LOCALES,
  defaultPageText,
  pageTextKey,
} from "./page-fields";

/**
 * The site's starting content, built from the placeholder files in /data.
 *
 * Used in two places:
 *  - as the fallback when Supabase isn't configured (local development),
 *    see lib/data.ts;
 *  - as the source for supabase/seed.sql, which loads the same wines,
 *    pictures and page settings into a fresh Supabase project.
 */

// Section-image placeholders matching what the public pages show by
// default. Pre-seeding these into the media library means the first visit
// to Page Content already has real pickable thumbnails, not an empty grid.
// These are local files under /public.
export const PAGE_SECTION_SEEDS: { key: string; fileName: string; url: string }[] = [
  { key: "home.heroBackground", fileName: "pianezzo-vineyard.jpg", url: "/placeholders/home-hero-background.jpg" },
  { key: "home.philosophyTeaser", fileName: "roberto-vineyard-teaser.jpg", url: "/placeholders/home-philosophy-teaser.jpg" },
  { key: "winery.philosophy", fileName: "roberto-in-cellar.jpg", url: "/placeholders/winery-philosophy.jpg" },
  { key: "winery.vineyard", fileName: "the-vineyard.jpg", url: "/placeholders/winery-vineyard.jpg" },
  { key: "winery.harvest", fileName: "harvest.jpg", url: "/placeholders/winery-harvest.jpg" },
  { key: "winery.cellar", fileName: "the-cellar.jpg", url: "/placeholders/winery-cellar.jpg" },
  { key: "about.history", fileName: "estate-1958.jpg", url: "/placeholders/about-history.jpg" },
  { key: "about.today", fileName: "estate-today.jpg", url: "/placeholders/about-today.jpg" },
  { key: "about.roberto", fileName: "roberto-valletti.jpg", url: "/team/roberto-valletti.jpg" },
];

// Extra photos already in /public but not assigned to any wine or page
// section — they just show up in the Media Library to pick from.
export const EXTRA_MEDIA_SEEDS: { id: string; fileName: string; url: string }[] = [
  {
    id: "media-extra-roberto-furgone",
    fileName: "roberto-furgone-cassette.jpg",
    url: "/uploads/1785169848790-Billede-07.02.2024-kl.-19.04.jpg",
  },
];

export function seedMedia(): MediaItem[] {
  const wineMedia = wines.map((w) => ({
    id: `media-${w.id}`,
    url: w.imageUrl,
    fileName: `${w.slug}.jpg`,
    uploadedAt: "2026-01-15",
  }));
  const pageMedia = PAGE_SECTION_SEEDS.map((s) => ({
    id: `media-page-${s.key}`,
    url: s.url,
    fileName: s.fileName,
    uploadedAt: "2026-01-15",
  }));
  const extraMedia = EXTRA_MEDIA_SEEDS.map((s) => ({
    id: s.id,
    url: s.url,
    fileName: s.fileName,
    uploadedAt: "2026-08-19",
  }));
  return [...wineMedia, ...pageMedia, ...extraMedia];
}

export function seedPageImages(): Record<string, string> {
  return Object.fromEntries(PAGE_SECTION_SEEDS.map((s) => [s.key, `media-page-${s.key}`]));
}

// Editable site text (see /admin/pages):
//  - Opening Hours (PageText on the Visit page) — English only for now.
//  - Home / Winery / About texts, per language (see data/page-fields.ts),
//    starting from the current translations in /messages.
export function seedPageText(): Record<string, string> {
  const text: Record<string, string> = {
    "visit.openingHoursTitle": en.visit.openingHoursTitle,
    "visit.openingHoursText": en.visit.openingHoursText,
  };
  for (const locale of TEXT_LOCALES) {
    for (const page of EDITABLE_PAGES) {
      for (const { key } of PAGE_TEXT_FIELDS[page]) {
        text[pageTextKey(locale, page, key)] = defaultPageText(locale, page, key);
      }
    }
  }
  return text;
}

export function seedAdminWines(): AdminWine[] {
  return wines.map((w) => ({ ...w, imageMediaId: `media-${w.id}` }));
}

export function seedSiteData(): SiteData {
  return {
    wines: seedAdminWines(),
    media: seedMedia(),
    retailers,
    closures,
    pageImages: seedPageImages(),
    pageText: seedPageText(),
    siteSettings: DEFAULT_SITE_SETTINGS,
  };
}
