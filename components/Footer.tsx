import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { BrandName, BrandLegalName } from "./BrandMark";

export default async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-wine-dark text-cream/80 text-sm">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <BrandName className="font-serif text-xl text-cream mb-2 block" />
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
          © {year} <BrandLegalName />. {t("rights")}
        </span>
      </div>
    </footer>
  );
}
