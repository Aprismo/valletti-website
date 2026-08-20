"use client";

import { useState, FormEvent } from "react";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminRetailersPage() {
  const { retailers, addRetailer, deleteRetailer } = useAdminStore();
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addRetailer({
      name: String(data.get("name") || ""),
      type: (String(data.get("type") || "shop") as "shop" | "restaurant" | "importer"),
      region: String(data.get("region") || ""),
      country: String(data.get("country") || ""),
      website: String(data.get("website") || "") || undefined,
    });
    e.currentTarget.reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-black">Retailers</h1>
          <p className="text-ink/60 text-sm">
            Shown on the public &ldquo;Where to Buy&rdquo; page.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add retailer"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black/10 p-6 grid sm:grid-cols-2 gap-4 mb-6"
        >
          <input name="name" required placeholder="Name" className="input" />
          <select name="type" className="input">
            <option value="shop">Shop</option>
            <option value="restaurant">Restaurant</option>
            <option value="importer">Importer</option>
          </select>
          <input name="region" placeholder="Region" className="input" />
          <input name="country" required placeholder="Country" className="input" />
          <input name="website" placeholder="Website (optional)" className="input sm:col-span-2" />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 text-sm w-fit hover:opacity-90"
          >
            Save
          </button>
        </form>
      )}

      <div className="bg-white border border-black/10 divide-y divide-black/5">
        {retailers.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-ink/60">
                {r.type} · {r.region}, {r.country}
              </div>
            </div>
            <button
              onClick={() => deleteRetailer(r.id)}
              className="text-sm text-red-700 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid rgba(0, 0, 0, 0.15);
          padding: 0.5rem 0.75rem;
          background: white;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #000000;
        }
      `}</style>
    </div>
  );
}
