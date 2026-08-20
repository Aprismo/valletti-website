"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(next: Locale) {
    router.replace(
      // @ts-expect-error -- pathname/params typing from next-intl is dynamic
      { pathname, params },
      { locale: next }
    );
  }

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => handleChange(e.target.value as Locale)}
      className="bg-transparent border border-gold/40 text-xs tracking-wide uppercase px-2 py-1.5 rounded-sm text-cream focus:outline-none focus:border-gold cursor-pointer"
    >
      {locales.map((l) => (
        <option key={l} value={l} className="text-ink">
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
