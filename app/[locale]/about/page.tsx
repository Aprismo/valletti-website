import { getTranslations } from "next-intl/server";
import PageImage from "@/components/PageImage";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed">
          {t("intro")}
        </p>
      </section>

      {/* History */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
        <div className="grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold mb-3 block">
              Since 1958
            </span>
            <h2 className="font-serif text-3xl text-wine mb-5">
              {t("historyTitle")}
            </h2>
            <p className="text-ink/80 leading-loose">{t("historyText")}</p>
          </div>
          <div className="relative aspect-[4/5] bg-cream-dark">
            <PageImage
              sectionKey="about.history"
              fallbackSrc="/placeholders/about-history.jpg"
              alt="The Valletti vineyard in the early years"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Today */}
      <section className="bg-cream-dark py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="relative aspect-[4/5] bg-white order-2 sm:order-1">
              <PageImage
                sectionKey="about.today"
                fallbackSrc="/placeholders/about-today.jpg"
                alt="The Valletti estate today"
                className="object-cover"
              />
            </div>
            <div className="order-1 sm:order-2">
              <span className="text-xs uppercase tracking-widest text-gold mb-3 block">
                Today
              </span>
              <h2 className="font-serif text-3xl text-wine mb-5">
                {t("todayTitle")}
              </h2>
              <p className="text-ink/80 leading-loose">{t("todayText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roberto */}
      <section className="mx-auto max-w-2xl px-6 py-24 sm:py-28 text-center">
        <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden mb-8 ring-4 ring-cream-dark bg-cream-dark">
          <PageImage
            sectionKey="about.roberto"
            fallbackSrc="/team/roberto-valletti.jpg"
            alt="Roberto Valletti portrait"
            className="object-cover"
          />
        </div>
        <h2 className="font-serif text-3xl text-wine mb-6">
          {t("robertoTitle")}
        </h2>
        <p className="text-ink/80 leading-loose">{t("robertoText")}</p>
      </section>
    </div>
  );
}
