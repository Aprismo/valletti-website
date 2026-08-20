"use client";

import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";

/**
 * Renders a page-section image that Roberto can change from
 * /admin/pages (Page Content). Falls back to the seeded default if no
 * picture has been chosen for that section yet.
 *
 * PROTOTYPE NOTE: the admin store is in-memory only (see
 * lib/admin-store.tsx), so a picture picked/uploaded in admin is only
 * visible in that same browser while the tab stays open — it does not
 * yet persist to other visitors or across a reload. That will work for
 * real once the site is connected to Supabase.
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
