import { getLocale, getTranslations } from "next-intl/server";
import { getActiveClosure, formatDateRange } from "@/data/closures";

export default async function ClosureBanner() {
  const closure = getActiveClosure();
  if (!closure) return null;

  const locale = await getLocale();
  const t = await getTranslations("closure");
  const { s, e } = formatDateRange(closure.startDate, closure.endDate, locale);

  return (
    <div className="bg-terracotta text-cream text-xs">
      <div className="mx-auto max-w-6xl px-6 py-1.5 text-center">
        {t("banner", { start: s, end: e })}
      </div>
    </div>
  );
}
