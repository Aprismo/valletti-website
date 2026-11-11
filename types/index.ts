export type WineType = "red" | "white" | "rose" | "sparkling";

export type AgingVessel = "steel" | "barrel";

// Common oak barrel sizes used in Piemonte winemaking, from small French
// barrique up to the large traditional Slavonian botte — shown as a
// dropdown in admin so Roberto picks from a fixed list rather than
// typing free text.
export const BARREL_SIZES = [
  "225L (barrique)",
  "350L",
  "500L (tonneau)",
  "1000L (botte piccola)",
  "2500L (botte grande)",
  "5000L+ (botte grande)",
] as const;
export type BarrelSize = (typeof BARREL_SIZES)[number];

// A single blended vineyard parcel, as used on Roberto's technical sheets
// (e.g. "Exposure: West / Soil: Formazione di Lequio.../ Average age: 15
// years old"). Wines blended from multiple parcels list one of these per
// parcel; this is optional since not every wine's sheet breaks it down
// this way.
export interface VineyardParcel {
  exposure: string; // e.g. "West"
  soil: string; // e.g. "Formazione di Lequio (Serravalliano), clayey marl with silt, brown colour"
  averageAge: string; // e.g. "15 years old"
}

export interface Wine {
  id: string;
  slug: string;
  name: string;
  type: WineType;
  grapeVariety: string;
  vineyardName: string;
  vineyardDescription: string;
  plotSize: string; // e.g. "0.8 ha" — the specific field/parcel size
  grapeDescription: string;
  // The following technical-sheet fields are optional because Roberto's
  // sheets don't cover every wine in this level of detail yet — only
  // fields Roberto has confirmed should be filled in per wine, so his
  // sheet stays the single source of truth.
  altitude?: string; // e.g. "500 m s.l.m. (1640 ft)"
  trainingSystem?: string; // e.g. "Espalier with Guyot pruning system"
  cultivationMethod?: string; // e.g. "No systemic products used; weed control carried out mechanically"
  harvestPeriod?: string; // e.g. "Mid-September"
  grapeYield?: string; // e.g. "7 tons per hectare (2.8 tons per acre)"
  vineyardParcels?: VineyardParcel[]; // breakdown of blended parcels, if the sheet gives one
  unfiltered?: boolean; // shown as a small note on the wine page when true
  fermentation: string; // e.g. "Stainless steel, temperature-controlled, 10 days"
  maceration: string; // e.g. "12–15 days on the skins"
  agingVessel: AgingVessel;
  barrelSize?: BarrelSize; // only relevant when agingVessel is "barrel"
  agingNotes: string; // e.g. "18 months, then 6 months in bottle before release"
  experienceDescription: string;
  pairingText: string;
  abv: string;
  servingTemp: string;
  imageUrl: string;
  featured: boolean;
}

export interface Retailer {
  id: string;
  name: string;
  type: "shop" | "restaurant" | "importer";
  region: string;
  country: string;
  website?: string;
  address?: string;
}

export interface ClosurePeriod {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  note?: string;
  active: boolean;
}

export interface PageSection {
  id: string;
  page: "home" | "winery" | "about";
  title: string;
  body: string;
  order: number;
}

// ── Design profile ──────────────────────────────────────────────────
// Everything needed to control the site's look from one place: name/
// logo, a small palette, two fonts (heading + body), and the physical
// address the Visit page's map and contact info are built from. See
// /admin/design, /lib/fonts.ts and /data/site-settings.ts.
export interface SiteSettings {
  // Identity
  name: string; // e.g. "Valletti" — shown in the header, footer, admin sidebar
  legalName: string; // e.g. "Azienda Agricola Valletti" — used in the footer copyright line
  tagline: string;
  logoUrl: string; // path/URL to the logo image (any aspect ratio)

  // Colors — plain hex strings, edited via <input type="color"> in admin.
  // Generic role names on purpose (not "wine"/"gold") so the same fields
  // make sense for any winery's palette. These map onto the site's
  // existing CSS custom properties in globals.css (see SiteTheme.tsx).
  colorPrimary: string; // headers, hero backgrounds, primary text accents
  colorPrimaryDark: string; // header/footer background, darkest shade of primary
  colorAccent: string; // links, small accents, section numbers
  colorBackground: string; // page background
  colorBackgroundAlt: string; // alternating section background
  colorText: string; // body text
  colorHighlight: string; // closure banner / notice highlight color

  // Fonts — ids referencing the curated list in /lib/fonts.ts, not raw
  // font-family strings, so every option is guaranteed to actually be
  // loadable (see googleFontsHref() in that file).
  headingFont: string;
  bodyFont: string;

  // Address — one physical location. Kept separate from the translated
  // page copy in /messages because the Visit page map and the "tel:" /
  // "Open in Google Maps" links are built directly from this, in every
  // language, with no lookup or API key required (see AddressMap.tsx).
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  phone: string;
}

// ── Admin / database shapes ─────────────────────────────────────────
// A picture in the media library. `storagePath` is set for files in the
// Supabase `media` bucket (so they can be deleted there too); pictures
// that ship with the site under /public have no storage path.
export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  storagePath?: string;
}

// A wine as the admin panel sees it: the public Wine plus which media
// library picture it uses.
export interface AdminWine extends Wine {
  imageMediaId: string;
}

// Everything the site needs to render, loaded once per request on the
// server (from Supabase, or from /data when Supabase isn't configured).
export interface SiteData {
  wines: AdminWine[];
  media: MediaItem[];
  retailers: Retailer[];
  closures: ClosurePeriod[];
  pageImages: Record<string, string>; // section key -> media id
  pageText: Record<string, string>; // text key -> value (English only for now)
  siteSettings: SiteSettings;
}
