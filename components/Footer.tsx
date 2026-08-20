import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import Image from "next/image";

export default async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-wine-dark text-cream/80 text-sm">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-serif text-xl text-cream mb-2">Valletti</div>
          <p>{t("tagline")}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/the-winery" className="hover:text-gold">
            {nav("winery")}
          </Link>
          <Link href="/about" className="hover:text-gold">
            {nav("about")}
          </Link>
          <Link href="/wines" className="hover:text-gold">
            {nav("wines")}
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/visit" className="hover:text-gold">
            {nav("visit")}
          </Link>
          <Link href="/where-to-buy" className="hover:text-gold">
            {nav("whereToBuy")}
          </Link>
          <NextLink href="/admin" className="hover:text-gold opacity-60">
            Admin
          </NextLink>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-4 text-xs text-center flex flex-col items-center gap-1">
        <span>
          © {year} Azienda Agricola Valletti. {t("rights")}
        </span>
        <span className="text-cream/50 flex items-center gap-1.5">
          Made by
          <Image
            src="/images/aprismo-logo.png"
            alt="Aprismo"
            width={14}
            height={14}
            className="inline-block opacity-70"
          />
          Aprismo
        </span>
      </div>
    </footer>
  );
}
