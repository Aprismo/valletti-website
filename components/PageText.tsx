"use client";

import { ElementType } from "react";
import { useAdminStore } from "@/lib/admin-store";

/**
 * Renders a piece of site text that Roberto can change from
 * /admin/pages (Page Content), e.g. Opening Hours. Falls back to the
 * translated default if nothing has been set yet. English only for
 * now — same limitation as PageImage.
 */
export default function PageText({
  textKey,
  fallback,
  as: Tag = "span",
  className,
}: {
  textKey: string;
  fallback: string;
  as?: ElementType;
  className?: string;
}) {
  const { pageText } = useAdminStore();
  return <Tag className={className}>{pageText[textKey] ?? fallback}</Tag>;
}
