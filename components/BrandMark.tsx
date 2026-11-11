"use client";

import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";

/**
 * The winery's logo + name, read from the design profile (see
 * /admin/design) instead of being hardcoded — this is what lets Header
 * and Footer work unchanged for any winery this template is reused for.
 *
 * Uses a fixed-height box with `fill` + `object-contain` rather than
 * fixed width/height, since a new winery's logo can have any aspect
 * ratio (square mark, wide wordmark, tall crest, ...).
 */
export function BrandLogo({ className = "h-16 w-40" }: { className?: string }) {
  const { siteSettings } = useAdminStore();
  return (
    <div className={`relative bg-cream rounded-sm px-3 py-1.5 ${className}`}>
      <Image
        src={siteSettings.logoUrl}
        alt={siteSettings.name}
        fill
        sizes="220px"
        className="object-contain"
        priority
      />
    </div>
  );
}

export function BrandName({ className }: { className?: string }) {
  const { siteSettings } = useAdminStore();
  return <span className={className}>{siteSettings.name}</span>;
}

export function BrandLegalName({ className }: { className?: string }) {
  const { siteSettings } = useAdminStore();
  return <span className={className}>{siteSettings.legalName}</span>;
}
