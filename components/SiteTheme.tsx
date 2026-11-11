"use client";

import { useAdminStore } from "@/lib/admin-store";
import {
  HEADING_FONTS,
  BODY_FONTS,
  getFontOption,
  fontFamilyCss,
  googleFontsHref,
} from "@/lib/fonts";

/**
 * Applies the current design profile (see /admin/design) to the whole
 * site: it points the site's CSS custom properties at the chosen
 * colors/fonts, and loads the two selected Google Fonts. Rendered once
 * near the root (see app/layout.tsx), after AdminStoreProvider so it can
 * read siteSettings.
 *
 * Colors/fonts re-declare the SAME variable names globals.css already
 * defines (--color-wine, --font-serif, etc.) rather than renaming them
 * everywhere in the app — every component that already uses e.g.
 * `text-wine` or `font-serif` picks up a new winery's colors/fonts
 * automatically, with no other file needing to change.
 *
 * The <link>/<style> tags below render inside <body> but React 19 (which
 * this app uses) automatically hoists them into <head> wherever they're
 * rendered in the tree.
 *
 * The design profile is loaded server-side (lib/data.ts) and passed into
 * the store, so this is already correct in the server-rendered HTML.
 * (In local mode without Supabase, a profile saved in localStorage is
 * applied a moment after load.)
 */
export default function SiteTheme() {
  const { siteSettings } = useAdminStore();

  const heading = getFontOption(HEADING_FONTS, siteSettings.headingFont, "cormorant");
  const body = getFontOption(BODY_FONTS, siteSettings.bodyFont, "inter");
  const fontsHref = googleFontsHref([heading, body]);

  const css = `
    :root {
      --color-wine: ${siteSettings.colorPrimary};
      --color-wine-dark: ${siteSettings.colorPrimaryDark};
      --color-gold: ${siteSettings.colorAccent};
      --color-cream: ${siteSettings.colorBackground};
      --color-cream-dark: ${siteSettings.colorBackgroundAlt};
      --color-ink: ${siteSettings.colorText};
      --color-terracotta: ${siteSettings.colorHighlight};
      --font-serif: ${fontFamilyCss(heading)};
      --font-sans: ${fontFamilyCss(body)};
    }
  `;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsHref} />
      {/* A plain <style> tag, not next/head — this needs to re-render
         (and therefore re-apply) whenever siteSettings changes, e.g.
         while an admin is live-previewing a color or font change in
         /admin/design. */}
      <style id="site-theme">{css}</style>
    </>
  );
}
