import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const t = await getTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/the-winery", label: t("winery") },
    { href: "/about", label: t("about") },
    { href: "/wines", label: t("wines") },
    { href: "/visit", label: t("visit") },
    { href: "/where-to-buy", label: t("whereToBuy") },
  ];

  return (
    <header className="bg-wine-dark text-cream sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/brand/logo.jpeg"
            alt="Valletti — Azienda Agricola"
            width={220}
            height={94}
            className="h-16 w-auto bg-cream rounded-sm px-3 py-1.5"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm uppercase tracking-wide">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
      <nav className="md:hidden flex flex-wrap gap-x-2 px-4 pb-2 text-xs uppercase tracking-wide">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-2 py-2.5 hover:text-gold"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
