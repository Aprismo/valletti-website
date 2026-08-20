import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { wines } from "@/data/wines";

export default async function WinesPage() {
  const t = await getTranslations("wines");

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed">{t("intro")}</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {wines.map((wine) => (
            <Link key={wine.id} href={`/wines/${wine.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 p-4">
                <Image
                  src={wine.imageUrl}
                  alt={wine.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h2 className="font-serif text-xl text-wine">{wine.name}</h2>
              <p className="text-sm text-ink/60 mb-1">
                {t("grapeLabel")}: {wine.grapeVariety}
              </p>
              <span className="text-xs uppercase tracking-wide text-gold">
                {t("viewDetails")} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
