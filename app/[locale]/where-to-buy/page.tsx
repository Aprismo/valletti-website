import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { retailers } from "@/data/retailers";

export default async function WhereToBuyPage() {
  const t = await getTranslations("whereToBuy");

  const byCountry = retailers.reduce<Record<string, typeof retailers>>(
    (acc, r) => {
      (acc[r.country] ??= []).push(r);
      return acc;
    },
    {}
  );

  return (
    <div>
      <section className="bg-wine text-cream py-24 sm:py-28 text-center px-6">
        <h1 className="font-serif text-4xl sm:text-5xl mb-5">{t("title")}</h1>
        <p className="max-w-2xl mx-auto text-cream/85 leading-relaxed mb-6">{t("intro")}</p>
        <Link
          href="/visit"
          className="inline-block bg-gold text-wine-dark px-6 py-3 text-sm uppercase tracking-wide font-medium hover:opacity-90"
        >
          {t("askCta")}
        </Link>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-12">
          {Object.entries(byCountry).map(([country, list]) => (
            <div key={country}>
              <h2 className="font-serif text-2xl text-wine mb-4">
                {country}
              </h2>
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                {list.map((r) => (
                  <li
                    key={r.id}
                    className="py-4 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-medium text-ink">{r.name}</div>
                      <div className="text-sm text-ink/60">
                        {t("regionLabel")}: {r.region} · {t("typeLabel")}:{" "}
                        {r.type}
                      </div>
                    </div>
                    {r.website && (
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-wine underline underline-offset-4 hover:text-gold"
                      >
                        Website →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-cream-dark p-10">
          <h2 className="font-serif text-xl text-wine mb-2">
            {t("notListedTitle")}
          </h2>
          <p className="text-ink/75 mb-6 max-w-lg mx-auto">
            {t("notListedText")}
          </p>
          <Link
            href="/visit"
            className="inline-block border border-wine text-wine px-6 py-3 text-sm uppercase tracking-wide hover:bg-wine hover:text-cream transition-colors"
          >
            {t("askCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
