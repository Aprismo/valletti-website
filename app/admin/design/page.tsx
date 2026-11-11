"use client";

import { useRef } from "react";
import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";
import { HEADING_FONTS, BODY_FONTS, getFontOption, fontFamilyCss } from "@/lib/fonts";
import { SiteSettings } from "@/types";

const COLOR_FIELDS: {
  key: keyof SiteSettings;
  label: string;
  hint: string;
}[] = [
  { key: "colorPrimary", label: "Primary color", hint: "Hero sections, headings, primary buttons" },
  { key: "colorPrimaryDark", label: "Primary — dark shade", hint: "Header and footer background" },
  { key: "colorAccent", label: "Accent color", hint: "Links, hover states, small highlights" },
  { key: "colorBackground", label: "Background", hint: "Main page background" },
  { key: "colorBackgroundAlt", label: "Background — alternate", hint: "Alternating section stripes" },
  { key: "colorText", label: "Text color", hint: "Body copy" },
  { key: "colorHighlight", label: "Highlight color", hint: "Closure banner and notices" },
];

const inputClass =
  "border border-black/15 px-3 py-2 text-sm bg-white focus:outline-none focus:border-black";

export default function AdminDesignPage() {
  const { siteSettings, updateSiteSettings, setLogo, flushSaves } = useAdminStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const heading = getFontOption(HEADING_FONTS, siteSettings.headingFont, "cormorant");
  const body = getFontOption(BODY_FONTS, siteSettings.bodyFont, "inter");

  const fullAddress = [
    siteSettings.addressLine1,
    siteSettings.addressLine2,
    siteSettings.addressLine3,
  ]
    .filter(Boolean)
    .join(", ");
  const mapPreviewUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&output=embed`;

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await setLogo(file);
    e.target.value = "";
  }

  // onBlur bubbles up from every field: leaving a field saves it at once.
  return (
    <div className="max-w-3xl" onBlur={flushSaves}>
      <h1 className="font-serif text-3xl text-black mb-1">Design & Branding</h1>
      <p className="text-ink/60 text-sm mb-8">
        The design profile for this site — name, logo, colors, fonts and
        address. Change anything on this page and the whole public site and
        admin panel update to match. Changes save automatically (watch the
        status in the bottom-right corner) and are live immediately.
      </p>

      {/* Identity */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-medium mb-4">Identity</h2>
        <div className="grid gap-5 max-w-lg">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Winery display name</span>
            <span className="text-xs text-ink/40">
              Shown in the header, footer and admin sidebar.
            </span>
            <input
              className={inputClass}
              value={siteSettings.name}
              onChange={(e) => updateSiteSettings({ name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Legal name</span>
            <span className="text-xs text-ink/40">
              Used in the footer&rsquo;s copyright line, e.g. &ldquo;© 2026{" "}
              {siteSettings.legalName || "Legal name"}&rdquo;.
            </span>
            <input
              className={inputClass}
              value={siteSettings.legalName}
              onChange={(e) => updateSiteSettings({ legalName: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Tagline / description</span>
            <span className="text-xs text-ink/40">
              Used for the browser tab title and search-result description —
              not shown on the pages themselves.
            </span>
            <input
              className={inputClass}
              value={siteSettings.tagline}
              onChange={(e) => updateSiteSettings({ tagline: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* Logo */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-medium mb-1">Logo</h2>
        <p className="text-xs text-ink/50 mb-4">
          Any shape or aspect ratio works — it&rsquo;s shown inside a fixed-size
          box across the header and admin sidebar.
        </p>
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-40 bg-cream rounded-sm border border-black/10">
            <Image
              src={siteSettings.logoUrl}
              alt={siteSettings.name}
              fill
              sizes="220px"
              className="object-contain p-2"
            />
          </div>
          <label className="bg-black text-white px-4 py-2 text-sm hover:opacity-90 cursor-pointer">
            Upload logo
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* Colors */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-medium mb-1">Colors</h2>
        <p className="text-xs text-ink/50 mb-4">
          The site&rsquo;s palette. These roles are used consistently across
          every page, so seven colors are enough to re-skin the whole site.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {COLOR_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">{f.label}</span>
              <span className="text-xs text-ink/40">{f.hint}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={siteSettings[f.key] as string}
                  onChange={(e) => updateSiteSettings({ [f.key]: e.target.value })}
                  className="h-9 w-12 border border-black/15 p-0.5 bg-white cursor-pointer"
                />
                <input
                  className={`${inputClass} flex-1`}
                  value={siteSettings[f.key] as string}
                  onChange={(e) => updateSiteSettings({ [f.key]: e.target.value })}
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Fonts */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-medium mb-1">Fonts</h2>
        <p className="text-xs text-ink/50 mb-4">
          Pick one heading font and one body font from the curated list
          below — every option is already set up and ready to use.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="flex flex-col gap-1 text-sm mb-3">
              <span className="text-ink/70">Heading font</span>
              <select
                className={inputClass}
                value={siteSettings.headingFont}
                onChange={(e) => updateSiteSettings({ headingFont: e.target.value })}
              >
                {HEADING_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="text-2xl text-wine border border-black/10 bg-cream p-4"
              style={{ fontFamily: fontFamilyCss(heading) }}
            >
              {siteSettings.name || "Your Winery"}
            </div>
          </div>
          <div>
            <label className="flex flex-col gap-1 text-sm mb-3">
              <span className="text-ink/70">Body font</span>
              <select
                className={inputClass}
                value={siteSettings.bodyFont}
                onChange={(e) => updateSiteSettings({ bodyFont: e.target.value })}
              >
                {BODY_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="text-sm text-ink border border-black/10 bg-cream p-4 leading-relaxed"
              style={{ fontFamily: fontFamilyCss(body) }}
            >
              Wines shaped by hand, patience, and a piece of Italian hillside.
            </div>
          </div>
        </div>
      </section>

      {/* Address & contact */}
      <section className="bg-white border border-black/10 p-6">
        <h2 className="font-medium mb-1">Address & Contact</h2>
        <p className="text-xs text-ink/50 mb-4">
          Drives the address, phone number and map on the Visit page in every
          language. The map is built directly from the address below — no
          separate setup needed, and it works the same way for any address.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Address — line 1</span>
              <input
                className={inputClass}
                value={siteSettings.addressLine1}
                onChange={(e) => updateSiteSettings({ addressLine1: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Address — line 2</span>
              <input
                className={inputClass}
                value={siteSettings.addressLine2}
                onChange={(e) => updateSiteSettings({ addressLine2: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Address — line 3</span>
              <input
                className={inputClass}
                value={siteSettings.addressLine3}
                onChange={(e) => updateSiteSettings({ addressLine3: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Phone</span>
              <input
                className={inputClass}
                value={siteSettings.phone}
                onChange={(e) => updateSiteSettings({ phone: e.target.value })}
              />
            </label>
          </div>
          <div className="aspect-video bg-cream-dark overflow-hidden">
            {fullAddress ? (
              <iframe
                title="Address preview"
                src={mapPreviewUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink/40 p-4 text-center">
                Enter an address to preview the map.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
