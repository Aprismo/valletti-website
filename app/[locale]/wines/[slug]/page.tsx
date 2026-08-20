import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getWineBySlug, wines } from "@/data/wines";

export function generateStaticParams() {
  return wines.map((w) => ({ slug: w.slug }));
}

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wine = getWineBySlug(slug);
  if (!wine) notFound();

  const t = await getTranslations("wines");

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/wines"
          className="text-sm text-wine underline underline-offset-4 hover:text-gold"
        >
          ← {t("backToWines")}
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 grid sm:grid-cols-2 gap-12">
        <div className="relative aspect-[3/4] bg-white p-8">
          <Image
            src={wine.imageUrl}
            alt={wine.name}
            fill
            className="object-contain"
            priority
          />
        </div>

        <div>
          <h1 className="font-serif text-4xl text-wine mb-2">
            {wine.name}
          </h1>
          <p className="text-ink/60 mb-8">{wine.grapeVariety}</p>

          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gold mb-2">
              {t("experienceTitle")}
            </h2>
            <p className="text-ink/85 leading-relaxed">
              {wine.experienceDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-ink/10 text-sm">
            <div>
              <div className="text-ink/50 text-xs uppercase tracking-wide mb-1">
                {t("abvLabel")}
              </div>
              <div>{wine.abv}</div>
            </div>
            <div>
              <div className="text-ink/50 text-xs uppercase tracking-wide mb-1">
                {t("servingTempLabel")}
              </div>
              <div>{wine.servingTemp}</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xs uppercase tracking-wide text-gold mb-2">
              {t("pairingTitle")}
            </h2>
            <p className="text-ink/85 leading-relaxed">{wine.pairingText}</p>
          </div>
        </div>
      </section>

      {/* Vineyard & grape */}
      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-2 gap-10">
          <div>
            <h2 className="font-serif text-xl text-wine mb-2">
              {t("vineyardTitle")} — {wine.vineyardName}
            </h2>
            {wine.plotSize && (
              <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">
                {t("plotSizeLabel")}: {wine.plotSize}
              </p>
            )}
            <p className="text-ink/80 leading-relaxed text-sm">
              {wine.vineyardDescription}
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-wine mb-2">
              {t("grapeTitle")} — {wine.grapeVariety}
            </h2>
            <p className="text-ink/80 leading-relaxed text-sm">
              {wine.grapeDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Technical sheet: altitude, training, cultivation, harvest, yield, parcels */}
      {(wine.altitude ||
        wine.trainingSystem ||
        wine.cultivationMethod ||
        wine.harvestPeriod ||
        wine.grapeYield ||
        (wine.vineyardParcels && wine.vineyardParcels.length > 0)) && (
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-ink/10">
          <h2 className="font-serif text-xl text-wine mb-6">
            {t("technicalTitle")}
          </h2>
          <div className="grid sm:grid-cols-4 gap-6 text-sm mb-10">
            {wine.altitude && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gold mb-1">
                  {t("altitudeLabel")}
                </div>
                <p className="text-ink/80 leading-relaxed">{wine.altitude}</p>
              </div>
            )}
            {wine.trainingSystem && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gold mb-1">
                  {t("trainingSystemLabel")}
                </div>
                <p className="text-ink/80 leading-relaxed">
                  {wine.trainingSystem}
                </p>
              </div>
            )}
            {wine.harvestPeriod && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gold mb-1">
                  {t("harvestLabel")}
                </div>
                <p className="text-ink/80 leading-relaxed">
                  {wine.harvestPeriod}
                </p>
              </div>
            )}
            {wine.grapeYield && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gold mb-1">
                  {t("yieldLabel")}
                </div>
                <p className="text-ink/80 leading-relaxed">
                  {wine.grapeYield}
                </p>
              </div>
            )}
            {wine.cultivationMethod && (
              <div className="sm:col-span-4">
                <div className="text-xs uppercase tracking-wide text-gold mb-1">
                  {t("cultivationMethodLabel")}
                </div>
                <p className="text-ink/80 leading-relaxed">
                  {wine.cultivationMethod}
                </p>
              </div>
            )}
          </div>

          {wine.vineyardParcels && wine.vineyardParcels.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gold mb-4">
                {t("parcelsTitle")}
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 text-sm">
                {wine.vineyardParcels.map((parcel, i) => (
                  <div key={i} className="border border-ink/10 p-4">
                    <div className="mb-2">
                      <span className="text-ink/50 text-xs uppercase tracking-wide">
                        {t("exposureLabel")}:{" "}
                      </span>
                      {parcel.exposure}
                    </div>
                    <div className="mb-2">
                      <span className="text-ink/50 text-xs uppercase tracking-wide">
                        {t("soilLabel")}:{" "}
                      </span>
                      {parcel.soil}
                    </div>
                    <div>
                      <span className="text-ink/50 text-xs uppercase tracking-wide">
                        {t("ageLabel")}:{" "}
                      </span>
                      {parcel.averageAge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wine.unfiltered && (
            <p className="text-ink/60 text-xs uppercase tracking-wide mt-8">
              {t("unfilteredNote")}
            </p>
          )}
        </section>
      )}

      {/* In the Cellar: fermentation, maceration, aging */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-serif text-xl text-wine mb-6">
          {t("cellarNotesTitle")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-gold mb-1">
              {t("fermentationLabel")}
            </div>
            <p className="text-ink/80 leading-relaxed">{wine.fermentation}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gold mb-1">
              {t("macerationLabel")}
            </div>
            <p className="text-ink/80 leading-relaxed">{wine.maceration}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gold mb-1">
              {t("agingLabel")}
            </div>
            <p className="text-ink/80 leading-relaxed">
              {wine.agingVessel === "barrel"
                ? `${t("agingVesselBarrel")}${wine.barrelSize ? ` (${wine.barrelSize})` : ""}`
                : t("agingVesselSteel")}
              {wine.agingNotes ? ` — ${wine.agingNotes}` : ""}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
