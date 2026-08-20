import { getTranslations } from "next-intl/server";
import PageImage from "@/components/PageImage";

export default async function WineryPage() {
  const t = await getTranslations("winery");

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed">
          {t("openingLine")}
        </p>
      </section>

      {/* Philosophy — editorial pull-quote */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
        <div className="grid sm:grid-cols-5 gap-12 sm:gap-16 items-center">
          <div className="relative aspect-[4/5] bg-cream-dark sm:col-span-2">
            <PageImage
              sectionKey="winery.philosophy"
              fallbackSrc="/placeholders/winery-philosophy.jpg"
              alt="Roberto Valletti in the cellar"
              className="object-cover"
            />
          </div>
          <div className="sm:col-span-3">
            <span className="block font-serif text-6xl text-gold leading-none mb-2">
              &ldquo;
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-wine leading-snug mb-6">
              {t("philosophyQuote")}
            </p>
            <p className="text-xs uppercase tracking-widest text-ink/50">
              {t("philosophyAttribution")}
            </p>
          </div>
        </div>
      </section>

      {/* The Vineyard */}
      <section className="bg-cream-dark py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold mb-3 block">
              01
            </span>
            <h2 className="font-serif text-3xl text-wine mb-5">
              {t("vineyardTitle")}
            </h2>
            <p className="text-ink/80 leading-loose mb-4">
              {t("vineyardText1")}
            </p>
            <p className="text-ink/80 leading-loose">{t("vineyardText2")}</p>
          </div>
          <div className="relative aspect-[4/5] bg-white">
            <PageImage
              sectionKey="winery.vineyard"
              fallbackSrc="/placeholders/winery-vineyard.jpg"
              alt="A Valletti vineyard, Dogliani"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* The Harvest */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div className="relative aspect-[4/5] bg-cream-dark order-2 sm:order-1">
            <PageImage
              sectionKey="winery.harvest"
              fallbackSrc="/placeholders/winery-harvest.jpg"
              alt="Harvest at the Valletti estate"
              className="object-cover"
            />
          </div>
          <div className="order-1 sm:order-2">
            <span className="text-xs uppercase tracking-widest text-gold mb-3 block">
              02
            </span>
            <h2 className="font-serif text-3xl text-wine mb-5">
              {t("harvestTitle")}
            </h2>
            <p className="text-ink/80 leading-loose mb-4">
              {t("harvestText1")}
            </p>
            <p className="text-ink/80 leading-loose">{t("harvestText2")}</p>
          </div>
        </div>
      </section>

      {/* The Cellar */}
      <section className="bg-cream-dark py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold mb-3 block">
              03
            </span>
            <h2 className="font-serif text-3xl text-wine mb-5">
              {t("cellarTitle")}
            </h2>
            <p className="text-ink/80 leading-loose mb-4">
              {t("cellarText1")}
            </p>
            <p className="text-ink/80 leading-loose">{t("cellarText2")}</p>
          </div>
          <div className="relative aspect-[4/5] bg-white">
            <PageImage
              sectionKey="winery.cellar"
              fallbackSrc="/placeholders/winery-cellar.jpg"
              alt="The Valletti cellar"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Closing philosophy */}
      <section className="bg-wine text-cream py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="block font-serif text-6xl text-gold leading-none mb-2">
            &ldquo;
          </span>
          <p className="font-serif text-2xl sm:text-3xl leading-snug mb-8">
            {t("closingQuote")}
          </p>
          <div className="w-16 h-px bg-gold/50 mx-auto mb-8" />
          <p className="text-cream/80 leading-loose text-sm sm:text-base">
            {t("closingText")}
          </p>
        </div>
      </section>
    </div>
  );
}
