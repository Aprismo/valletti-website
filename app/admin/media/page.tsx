"use client";

import { useRef } from "react";
import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";

export default function MediaLibraryPage() {
  const { media, addMedia, deleteMedia, wineCountUsingMedia } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    await Promise.all(Array.from(files).map((f) => addMedia(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDelete(id: string, fileName: string) {
    const usageCount = wineCountUsingMedia(id);
    if (usageCount > 0) {
      alert(
        `"${fileName}" is still used by ${usageCount} wine${
          usageCount > 1 ? "s" : ""
        }. Remove it from that wine first, or choose a different picture for it, before deleting.`
      );
      return;
    }
    if (confirm(`Delete "${fileName}" from the media library? This can't be undone.`)) {
      deleteMedia(id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-black">Media Library</h1>
          <p className="text-ink/60 text-sm">
            {media.length} picture{media.length === 1 ? "" : "s"}. Pictures stay
            here even if a wine using them is removed — delete a picture only
            when you&rsquo;re sure you don&rsquo;t need it anymore.
          </p>
        </div>
        <label className="bg-black text-white px-4 py-2 text-sm hover:opacity-90 cursor-pointer">
          + Upload pictures
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((m) => {
          const usage = wineCountUsingMedia(m.id);
          return (
            <div key={m.id} className="bg-white border border-black/10">
              <div className="relative aspect-[3/4] bg-neutral-100">
                <Image src={m.url} alt={m.fileName} fill className="object-cover" />
              </div>
              <div className="p-2">
                <div className="text-xs truncate" title={m.fileName}>
                  {m.fileName}
                </div>
                <div className="text-xs text-ink/50 mb-2">
                  {usage > 0 ? `Used by ${usage} wine${usage > 1 ? "s" : ""}` : "Not in use"}
                </div>
                <button
                  onClick={() => handleDelete(m.id, m.fileName)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
