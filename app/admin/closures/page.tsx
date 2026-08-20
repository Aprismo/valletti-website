"use client";

import { useState, FormEvent } from "react";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminClosuresPage() {
  const { closures, addClosure, updateClosure, deleteClosure } = useAdminStore();
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addClosure({
      startDate: String(data.get("startDate") || ""),
      endDate: String(data.get("endDate") || ""),
      note: String(data.get("note") || "") || undefined,
      active: true,
    });
    e.currentTarget.reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-black">Closure Periods</h1>
          <p className="text-ink/60 text-sm max-w-md">
            When active, a banner appears on the public site near the Visit
            page for this date range.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add closure period"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black/10 p-6 grid sm:grid-cols-3 gap-4 mb-6"
        >
          <label className="flex flex-col gap-1 text-sm">
            Start date
            <input type="date" name="startDate" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            End date
            <input type="date" name="endDate" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Note (internal)
            <input name="note" placeholder="e.g. Harvest" className="input" />
          </label>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 text-sm w-fit hover:opacity-90 sm:col-span-3"
          >
            Save
          </button>
        </form>
      )}

      <div className="bg-white border border-black/10 divide-y divide-black/5">
        {closures.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">
                {c.startDate} → {c.endDate}
              </div>
              {c.note && <div className="text-sm text-ink/60">{c.note}</div>}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={(e) => updateClosure(c.id, { active: e.target.checked })}
                />
                Active
              </label>
              <button
                onClick={() => deleteClosure(c.id)}
                className="text-sm text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {closures.length === 0 && (
          <p className="p-6 text-sm text-ink/60">
            No closure periods set — the site currently shows no banner.
          </p>
        )}
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
