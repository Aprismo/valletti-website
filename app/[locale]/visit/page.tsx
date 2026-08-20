import { getTranslations } from "next-intl/server";
import VisitForm from "@/components/VisitForm";
import PageText from "@/components/PageText";

const GOOGLE_MAPS_QUERY = encodeURIComponent(
  "Azienda Agricola Valletti, Borgata Pianezzo 32, 12063 Dogliani CN, Italy"
);
const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${GOOGLE_MAPS_QUERY}`;
const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`;
const PHONE_NUMBER = "+39 0173 71226";

export default async function VisitPage() {
  const t = await getTranslations("visit");

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed">{t("intro")}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-14">
        {/* Address + map */}
        <div>
          <h2 className="font-serif text-2xl text-wine mb-4">
            {t("addressTitle")}
          </h2>
          <address className="not-italic text-ink/85 leading-relaxed mb-4">
            {t("addressLine1")}
            <br />
            {t("addressLine2")}
            <br />
            {t("addressLine3")}
          </address>
          <a
            href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
            className="block text-sm text-ink/85 hover:text-wine mb-4"
          >
            {t("phoneLabel")}: {PHONE_NUMBER}
          </a>

          <PageText
            as="h3"
            textKey="visit.openingHoursTitle"
            fallback={t("openingHoursTitle")}
            className="font-serif text-lg text-wine mb-2"
          />
          <PageText
            as="p"
            textKey="visit.openingHoursText"
            fallback={t("openingHoursText")}
            className="text-sm text-ink/80 leading-relaxed mb-6"
          />
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm uppercase tracking-wide text-wine underline underline-offset-4 hover:text-gold mb-6"
          >
            {t("mapCta")} →
          </a>
          <div className="aspect-video bg-cream-dark overflow-hidden">
            <iframe
              title="Valletti winery location"
              src={GOOGLE_MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="font-serif text-2xl text-wine mb-4">
            {t("formTitle")}
          </h2>
          <VisitForm />
        </div>
      </section>
    </div>
  );
}
