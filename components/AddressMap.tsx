"use client";

import { useLocale } from "next-intl";
import { useAdminStore } from "@/lib/admin-store";
import { pageTextKey } from "@/data/page-fields";
import PageText from "@/components/PageText";

/**
 * Address, phone and map for the Visit page — built entirely from the
 * design profile's address fields (see /admin/design), so a new winery
 * only has to type its address once. No geocoding API key or lookup is
 * needed: Google's map-embed endpoint accepts a plain address string and
 * resolves it to the right place on its own, so the same code works for
 * any winery's address without any per-site setup.
 */
export default function AddressMap({
  addressTitle,
  phoneLabel,
  mapCta,
  openingHoursTitleFallback,
  openingHoursTextFallback,
}: {
  addressTitle: string;
  phoneLabel: string;
  mapCta: string;
  openingHoursTitleFallback: string;
  openingHoursTextFallback: string;
}) {
  const { siteSettings } = useAdminStore();
  const locale = useLocale();
  const { addressLine1, addressLine2, addressLine3, phone } = siteSettings;

  const fullAddress = [addressLine1, addressLine2, addressLine3]
    .filter(Boolean)
    .join(", ");
  const query = encodeURIComponent(fullAddress);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <div>
      <h2 className="font-serif text-2xl text-wine mb-4">{addressTitle}</h2>
      <address className="not-italic text-ink/85 leading-relaxed mb-4">
        {addressLine1}
        <br />
        {addressLine2}
        <br />
        {addressLine3}
      </address>
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        className="block text-sm text-ink/85 hover:text-wine mb-4"
      >
        {phoneLabel}: {phone}
      </a>

      <PageText
        as="h3"
        textKey={pageTextKey(locale, "visit", "openingHoursTitle")}
        fallback={openingHoursTitleFallback}
        className="font-serif text-lg text-wine mb-2"
      />
      <PageText
        as="p"
        textKey={pageTextKey(locale, "visit", "openingHoursText")}
        fallback={openingHoursTextFallback}
        className="text-sm text-ink/80 leading-relaxed mb-6 whitespace-pre-line"
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm uppercase tracking-wide text-wine underline underline-offset-4 hover:text-gold mb-6"
      >
        {mapCta} →
      </a>
      <div className="aspect-video bg-cream-dark overflow-hidden">
        <iframe
          title={`${siteSettings.name} winery location`}
          src={mapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
