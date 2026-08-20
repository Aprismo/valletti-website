"use client";

import Link from "next/link";
import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminWinesPage() {
  const { wines, media, deleteWine } = useAdminStore();

  function imageFor(mediaId: string) {
    return media.find((m) => m.id === mediaId)?.url;
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Remove "${name}" from the site? Its picture will stay in your media library.`)) {
      deleteWine(id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-black">Wines</h1>
          <p className="text-ink/60 text-sm">
            {wines.length} wine{wines.length === 1 ? "" : "s"} on the site
          </p>
        </div>
        <Link
          href="/admin/wines/new"
          className="bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + Add a new wine
        </Link>
      </div>

      <div className="bg-white border border-black/10 divide-y divide-black/5">
        {wines.map((wine) => (
          <div key={wine.id} className="flex items-center gap-4 p-4">
            <div className="relative w-14 h-18 aspect-[3/4] bg-neutral-100 shrink-0 overflow-hidden">
              {imageFor(wine.imageMediaId) && (
                <Image
                  src={imageFor(wine.imageMediaId)!}
                  alt={wine.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{wine.name}</div>
              <div className="text-sm text-ink/60">
                {wine.grapeVariety}
                {wine.featured && (
                  <span className="ml-2 text-xs bg-neutral-200 text-black px-1.5 py-0.5 rounded-sm">
                    Featured on homepage
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/admin/wines/${wine.id}`}
              className="text-sm text-black hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(wine.id, wine.name)}
              className="text-sm text-red-700 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        {wines.length === 0 && (
          <p className="p-6 text-sm text-ink/60">
            No wines yet — add your first one.
          </p>
        )}
      </div>
    </div>
  );
}
