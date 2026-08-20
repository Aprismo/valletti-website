import { ClosurePeriod } from "@/types";

/**
 * PLACEHOLDER DATA — set from /admin/closures in production.
 * Toggle `active` to see the closure banner appear on the Visit page.
 */
export const closures: ClosurePeriod[] = [
  {
    id: "1",
    startDate: "2026-08-10",
    endDate: "2026-08-24",
    note: "Summer harvest preparation",
    active: true,
  },
];

export function getActiveClosure(): ClosurePeriod | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const current = closures.find(
    (c) => c.active && c.startDate <= today && today <= c.endDate
  );
  if (current) return current;
  // Also surface an upcoming closure so visitors see it in advance.
  return closures
    .filter((c) => c.active && c.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}

export function formatDateRange(start: string, end: string, locale: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const s = new Date(start).toLocaleDateString(locale, opts);
  const e = new Date(end).toLocaleDateString(locale, opts);
  return { s, e };
}
