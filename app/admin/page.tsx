"use client";

import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import { getActiveClosure } from "@/data/closures";

export default function AdminDashboard() {
  const { wines, media, retailers, closures } = useAdminStore();
  const activeClosure = getActiveClosure();

  const cards = [
    { label: "Wines", value: wines.length, href: "/admin/wines" },
    { label: "Pictures in library", value: media.length, href: "/admin/media" },
    { label: "Retailers listed", value: retailers.length, href: "/admin/retailers" },
    { label: "Closure periods", value: closures.length, href: "/admin/closures" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-black mb-1">Dashboard</h1>
      <p className="text-ink/60 mb-8">Welcome back, Roberto.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-black/10 rounded-sm p-5 hover:border-black transition-colors"
          >
            <div className="text-3xl font-serif text-black">{c.value}</div>
            <div className="text-sm text-ink/60">{c.label}</div>
          </Link>
        ))}
      </div>

      {activeClosure && (
        <div className="bg-neutral-100 border border-neutral-300 p-5 mb-8 text-sm">
          The site is currently showing a closure banner for{" "}
          <strong>
            {activeClosure.startDate} – {activeClosure.endDate}
          </strong>
          . <Link href="/admin/closures" className="underline">Manage closure periods →</Link>
        </div>
      )}

      <div className="bg-white border border-black/10 p-6">
        <h2 className="font-medium mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/wines/new"
            className="bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            + Add a new wine
          </Link>
          <Link
            href="/admin/media"
            className="border border-black text-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Upload pictures
          </Link>
          <Link
            href="/admin/closures"
            className="border border-black/15 px-4 py-2 text-sm hover:border-black/30"
          >
            Set a closure period
          </Link>
        </div>
      </div>
    </div>
  );
}
