import { SiteSettings } from "@/types";

/**
 * Default design profile — Valletti's current real branding. This is the
 * seed the in-memory admin store starts from (see lib/admin-store.tsx)
 * and the fallback used anywhere the design profile hasn't loaded yet.
 * Roberto can change any of these live from /admin/design; the values
 * below are just the starting point.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: "Valletti",
  legalName: "Azienda Agricola Valletti",
  tagline: "Azienda Agricola Valletti — Piemonte, Italy",
  logoUrl: "/brand/logo.jpeg",

  colorPrimary: "#5c1a2b",
  colorPrimaryDark: "#3a0f1c",
  colorAccent: "#b98b3e",
  colorBackground: "#f6f0e6",
  colorBackgroundAlt: "#ece2d0",
  colorText: "#2a2320",
  colorHighlight: "#a8583a",

  headingFont: "cormorant",
  bodyFont: "inter",

  addressLine1: "Azienda Agricola Valletti",
  addressLine2: "Borgata Pianezzo, 32",
  addressLine3: "12063 Dogliani (CN), Piemonte, Italy",
  phone: "+39 0173 71226",
};
