"use client";

import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";

/**
 * Renders a page-section image that Roberto can change from
 * /admin/pages (Page Content). Falls back to the seeded default if no
 * picture has been chosen for that section yet.
 * Picture choices are loaded from Supabase (or /data locally) via the
 * shared store, see lib/admin-store.tsx.
 */
export default function PageImage({
  sectionKey,
  fallbackSrc,
  alt,
  className,
}: {
  sectionKey: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  const { pageImages, mediaUrl } = useAdminStore();
  const src = mediaUrl(pageImages[sectionKey]) ?? fallbackSrc;

  return <Image src={src} alt={alt} fill className={className} />;
}
