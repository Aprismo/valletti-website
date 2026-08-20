"use client";

import { use } from "react";
import { useAdminStore } from "@/lib/admin-store";
import WineForm from "@/components/admin/WineForm";

export default function EditWinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { wines } = useAdminStore();
  const wine = wines.find((w) => w.id === id);

  if (!wine) {
    return <p className="text-sm text-ink/60">Wine not found.</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-black mb-6">
        Edit {wine.name}
      </h1>
      <WineForm initial={wine} wineId={wine.id} />
    </div>
  );
}
