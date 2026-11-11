import { getTranslations } from "next-intl/server";
import VisitForm from "@/components/VisitForm";
import AddressMap from "@/components/AddressMap";

export default async function VisitPage() {
  const t = await getTranslations("visit");

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed">{t("intro")}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-14">
        {/* Address + map — address comes from the design profile
           (/admin/design), the map is derived from it automatically. */}
        <AddressMap
          addressTitle={t("addressTitle")}
          phoneLabel={t("phoneLabel")}
          mapCta={t("mapCta")}
          openingHoursTitleFallback={t("openingHoursTitle")}
          openingHoursTextFallback={t("openingHoursText")}
        />

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
