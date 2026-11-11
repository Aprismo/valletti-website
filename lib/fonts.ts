/**
 * Curated font list for the design profile (see /admin/design and
 * types/SiteSettings). Every winery site built from this template picks
 * a heading font and a body font from these fixed lists — nothing else
 * is loadable, so there's no way to pick a font that then fails to load,
 * and no per-site font-file hosting/licensing to manage.
 *
 * Fonts are loaded at RUNTIME via a Google Fonts stylesheet <link> (see
 * SiteTheme.tsx), not via next/font/google. That's a deliberate choice:
 * next/font/google needs a live connection to fonts.googleapis.com at
 * `next build` / `next dev` time to self-host the files, which fails in
 * network-restricted build environments (this is the same reason the
 * rest of the app previously used system font stacks — see the old note
 * that used to live in app/layout.tsx). Loading by <link> instead only
 * needs network in the visitor's browser, same as any other website, and
 * naturally supports switching fonts per design profile without a
 * rebuild once site_settings moves to Supabase.
 */

export interface FontOption {
  id: string;
  label: string;
  family: string; // exact Google Fonts family name
  weights: string[]; // weights to request from Google Fonts
  fallback: string; // CSS fallback stack after the family name
}

export const HEADING_FONTS: FontOption[] = [
  {
    id: "cormorant",
    label: "Cormorant Garamond (elegant serif — default)",
    family: "Cormorant Garamond",
    weights: ["400", "500", "600", "700"],
    fallback: 'Didot, "Iowan Old Style", Georgia, serif',
  },
  {
    id: "playfair",
    label: "Playfair Display (high-contrast serif)",
    family: "Playfair Display",
    weights: ["400", "500", "600", "700"],
    fallback: "Georgia, serif",
  },
  {
    id: "ebgaramond",
    label: "EB Garamond (classic book serif)",
    family: "EB Garamond",
    weights: ["400", "500", "600", "700"],
    fallback: '"Iowan Old Style", Georgia, serif',
  },
  {
    id: "marcellus",
    label: "Marcellus (refined, understated serif)",
    family: "Marcellus",
    weights: ["400"],
    fallback: "Georgia, serif",
  },
  {
    id: "prata",
    label: "Prata (bold display serif)",
    family: "Prata",
    weights: ["400"],
    fallback: "Didot, Georgia, serif",
  },
  {
    id: "cinzel",
    label: "Cinzel (engraved, classical capitals)",
    family: "Cinzel",
    weights: ["400", "500", "600", "700"],
    fallback: "Georgia, serif",
  },
];

export const BODY_FONTS: FontOption[] = [
  {
    id: "inter",
    label: "Inter (clean, neutral — default)",
    family: "Inter",
    weights: ["400", "500", "600", "700"],
    fallback: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  {
    id: "lato",
    label: "Lato (warm, rounded)",
    family: "Lato",
    weights: ["400", "700"],
    fallback: "Helvetica, Arial, sans-serif",
  },
  {
    id: "nunitosans",
    label: "Nunito Sans (soft, friendly)",
    family: "Nunito Sans",
    weights: ["400", "500", "600", "700"],
    fallback: "Helvetica, Arial, sans-serif",
  },
  {
    id: "worksans",
    label: "Work Sans (crisp, modern)",
    family: "Work Sans",
    weights: ["400", "500", "600", "700"],
    fallback: "Helvetica, Arial, sans-serif",
  },
  {
    id: "sourcesans3",
    label: "Source Sans 3 (versatile, editorial)",
    family: "Source Sans 3",
    weights: ["400", "500", "600", "700"],
    fallback: "Helvetica, Arial, sans-serif",
  },
  {
    id: "jost",
    label: "Jost (geometric, contemporary)",
    family: "Jost",
    weights: ["400", "500", "600", "700"],
    fallback: "Helvetica, Arial, sans-serif",
  },
];

/** Look up a font option by id, falling back to the given default id. */
export function getFontOption(list: FontOption[], id: string, fallbackId: string): FontOption {
  return list.find((f) => f.id === id) ?? list.find((f) => f.id === fallbackId) ?? list[0];
}

/** A CSS font-family value for this option: `"Family Name", fallback, stack`. */
export function fontFamilyCss(font: FontOption): string {
  return `"${font.family}", ${font.fallback}`;
}

/**
 * Builds a single Google Fonts stylesheet URL requesting one or more
 * families at once (deduplicated), e.g.
 * https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap
 */
export function googleFontsHref(fonts: FontOption[]): string {
  const seen = new Set<string>();
  const families = fonts
    .filter((f) => {
      if (seen.has(f.family)) return false;
      seen.add(f.family);
      return true;
    })
    .map((f) => `family=${encodeURIComponent(f.family)}:wght@${f.weights.join(";")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
