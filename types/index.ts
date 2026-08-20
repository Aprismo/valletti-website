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
