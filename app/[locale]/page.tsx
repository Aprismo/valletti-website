import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import PageImage from "@/components/PageImage";
import ScrollHint from "@/components/ScrollHint";
import { wines } from "@/data/wines";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tWines = await getTranslations("wines");

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-wine text-cream overflow-hidden min-h-[100svh] flex items-center">
        {/* Background photo, behind everything, with a dark layer over it
            so the title/subtitle stay easy to read regardless of what
            picture is chosen. object-center keeps the photo's middle in
            frame as the window is resized. */}
        <div className="absolute inset-0">
          <PageImage
            sectionKey="home.heroBackground"
            fallbackSrc="/placeholders/home-hero-background.jpg"
            alt="Valletti vineyard"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-wine-dark/50" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20 text-center w-full">
          <Image
            src="/brand/logo-cream.png"
            alt={t("heroTitle")}
            width={358}
            height={216}
            priority
            className="mx-auto w-56 sm:w-72 h-auto mb-4"
          />
          <p className="max-w-xl mx-auto text-lg text-cream/85 mb-8">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/wines"
              className="bg-gold text-wine-dark px-6 py-3 text-sm uppercase tracking-wide font-medium hover:opacity-90"
            >
              {t("ctaWines")}
            </Link>
            <Link
              href="/visit"
              className="border border-cream/50 px-6 py-3 text-sm uppercase tracking-wide hover:border-cream"
            >
              {t("ctaVisit")}
            </Link>
          </div>
        </div>

      </section>

      {/* Scroll-down hint — fixed to the actual visible screen (not the
          hero section), so it always sits at the true bottom of what the
          visitor sees first, on any device, and fades out once they've
          scrolled past the first screen. */}
      <ScrollHint label={t("scrollHint")} />

      {/* Intro */}
      <section id="intro" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-5 text-wine">
          {t("introTitle")}
        </h2>
        <p className="text-ink/80 leading-relaxed">{t("introText")}</p>
      </section>

      {/* Wines — horizontal scroller */}
      <section className="bg-cream-dark py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-center text-wine mb-10 px-6">
            {t("featuredWinesTitle")}
          </h2>
          <div className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-proximity px-6 pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            {wines.map((wine) => (
              <Link
                key={wine.id}
                href={`/wines/${wine.slug}`}
                className="group block shrink-0 w-32 sm:w-36 snap-start"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-white mb-3 p-2">
                  <Image
                    src={wine.imageUrl}
                    alt={wine.name}
                    fill
                    sizes="150px"
                    className="object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-sm text-wine leading-snug">
                  {wine.name}
                </h3>
                <p className="text-xs text-ink/60">{wine.grapeVariety}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/wines"
              className="inline-block border border-wine text-wine px-6 py-3 text-sm uppercase tracking-wide hover:bg-wine hover:text-cream transition-colors"
            >
              {tWines("title")}
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy teaser */}
      <section className="mx-auto max-w-4xl px-6 py-20 grid sm:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] bg-cream-dark">
          <PageImage
            sectionKey="home.philosophyTeaser"
            fallbackSrc="/placeholders/home-philosophy-teaser.jpg"
            alt="Roberto Valletti in the vineyard"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-wine mb-4">
            {t("philosophyTeaser")}
          </h2>
          <p className="text-ink/80 leading-relaxed mb-6">
            {t("philosophyTeaserText")}
          </p>
          <Link
            href="/the-winery"
            className="text-wine underline underline-offset-4 hover:text-gold"
          >
            →
          </Link>
        </div>
      </section>
    </div>
  );
}
