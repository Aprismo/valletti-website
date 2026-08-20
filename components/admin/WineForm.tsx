"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";
import {
  Wine,
  WineType,
  AgingVessel,
  BarrelSize,
  BARREL_SIZES,
  VineyardParcel,
} from "@/types";

type FormWine = Omit<Wine, "id"> & { imageMediaId: string };

const emptyWine: FormWine = {
  slug: "",
  name: "",
  type: "red",
  grapeVariety: "",
  vineyardName: "",
  vineyardDescription: "",
  plotSize: "",
  grapeDescription: "",
  altitude: "",
  trainingSystem: "",
  cultivationMethod: "",
  harvestPeriod: "",
  grapeYield: "",
  vineyardParcels: [],
  unfiltered: false,
  fermentation: "",
  maceration: "",
  agingVessel: "steel",
  barrelSize: undefined,
  agingNotes: "",
  experienceDescription: "",
  pairingText: "",
  abv: "",
  servingTemp: "",
  imageUrl: "",
  featured: false,
  imageMediaId: "",
};

export default function WineForm({
  initial,
  wineId,
}: {
  initial?: FormWine;
  wineId?: string;
}) {
  const router = useRouter();
  const { media, addMedia, addWine, updateWine } = useAdminStore();
  const [form, setForm] = useState<FormWine>(initial ?? emptyWine);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormWine>(key: K, value: FormWine[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addParcel() {
    setForm((prev) => ({
      ...prev,
      vineyardParcels: [
        ...(prev.vineyardParcels ?? []),
        { exposure: "", soil: "", averageAge: "" },
      ],
    }));
  }

  function updateParcel<K extends keyof VineyardParcel>(
    index: number,
    key: K,
    value: VineyardParcel[K]
  ) {
    setForm((prev) => ({
      ...prev,
      vineyardParcels: (prev.vineyardParcels ?? []).map((p, i) =>
        i === index ? { ...p, [key]: value } : p
      ),
    }));
  }

  function removeParcel(index: number) {
    setForm((prev) => ({
      ...prev,
      vineyardParcels: (prev.vineyardParcels ?? []).filter(
        (_, i) => i !== index
      ),
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const item = await addMedia(file);
    set("imageMediaId", item.id);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const selectedUrl = media.find((m) => m.id === form.imageMediaId)?.url ?? "";
    const payload = { ...form, imageUrl: selectedUrl };

    if (wineId) {
      updateWine(wineId, payload);
    } else {
      addWine(payload);
    }
    router.push("/admin/wines");
  }

  const selectedImage = media.find((m) => m.id === form.imageMediaId);

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 max-w-3xl">
      {/* Picture */}
      <section className="bg-white border border-black/10 p-6">
        <h2 className="font-medium mb-4">Bottle picture</h2>
        <div className="flex gap-6 items-start">
          <div className="relative w-28 h-36 bg-neutral-100 shrink-0 overflow-hidden">
            {selectedImage && (
              <Image src={selectedImage.url} alt="" fill className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-ink/60 mb-3">
              Choose an existing picture from your library, or upload a new one.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {media.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => set("imageMediaId", m.id)}
                  className={`relative w-14 h-18 aspect-[3/4] overflow-hidden border-2 ${
                    form.imageMediaId === m.id
                      ? "border-black"
                      : "border-transparent"
                  }`}
                  title={m.fileName}
                >
                  <Image src={m.url} alt={m.fileName} fill className="object-cover" />
                </button>
              ))}
            </div>
            <label className="inline-block text-sm border border-black text-black px-3 py-1.5 cursor-pointer hover:bg-black hover:text-white transition-colors">
              Upload new picture
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Basics */}
      <section className="bg-white border border-black/10 p-6 grid gap-4">
        <h2 className="font-medium">Basics</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="URL slug">
            <input
              required
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as WineType)}
              className="input"
            >
              <option value="red">Red</option>
              <option value="white">White</option>
              <option value="rose">Rosé</option>
              <option value="sparkling">Sparkling</option>
            </select>
          </Field>
          <Field label="Grape variety">
            <input
              value={form.grapeVariety}
              onChange={(e) => set("grapeVariety", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Show on homepage as a featured wine
        </label>
      </section>

      {/* Vineyard & grape */}
      <section className="bg-white border border-black/10 p-6 grid gap-4">
        <h2 className="font-medium">Vineyard & Grape</h2>
        <Field label="Vineyard name">
          <input
            value={form.vineyardName}
            onChange={(e) => set("vineyardName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Vineyard description">
          <textarea
            rows={3}
            value={form.vineyardDescription}
            onChange={(e) => set("vineyardDescription", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Plot / field size">
          <input
            value={form.plotSize}
            onChange={(e) => set("plotSize", e.target.value)}
            className="input"
            placeholder="e.g. 1.2 ha"
          />
        </Field>
        <Field label="Grape description">
          <textarea
            rows={3}
            value={form.grapeDescription}
            onChange={(e) => set("grapeDescription", e.target.value)}
            className="input"
          />
        </Field>
      </section>

      {/* Technical sheet — mirrors the fields on Roberto's own tech sheets,
          so his sheet stays the single source of truth per wine. */}
      <section className="bg-white border border-black/10 p-6 grid gap-4">
        <h2 className="font-medium">Technical Sheet</h2>
        <p className="text-xs text-ink/50">
          Fill in whatever Roberto&rsquo;s sheet has for this wine — leave
          blank if not on his sheet. These are optional.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Altitude">
            <input
              value={form.altitude ?? ""}
              onChange={(e) => set("altitude", e.target.value)}
              className="input"
              placeholder="e.g. 500 m s.l.m. (1640 ft)"
            />
          </Field>
          <Field label="Harvest">
            <input
              value={form.harvestPeriod ?? ""}
              onChange={(e) => set("harvestPeriod", e.target.value)}
              className="input"
              placeholder="e.g. Mid-September"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Training system">
            <input
              value={form.trainingSystem ?? ""}
              onChange={(e) => set("trainingSystem", e.target.value)}
              className="input"
              placeholder="e.g. Espalier with Guyot pruning system"
            />
          </Field>
          <Field label="Grape yield">
            <input
              value={form.grapeYield ?? ""}
              onChange={(e) => set("grapeYield", e.target.value)}
              className="input"
              placeholder="e.g. 7 tons per hectare"
            />
          </Field>
        </div>
        <Field label="Cultivation method">
          <input
            value={form.cultivationMethod ?? ""}
            onChange={(e) => set("cultivationMethod", e.target.value)}
            className="input"
            placeholder="e.g. No systemic products; mechanical weed control"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.unfiltered ?? false}
            onChange={(e) => set("unfiltered", e.target.checked)}
          />
          Unfiltered wine
        </label>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink/70">Vineyard parcels</span>
            <button
              type="button"
              onClick={addParcel}
              className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
            >
              + Add parcel
            </button>
          </div>
          <div className="grid gap-3">
            {(form.vineyardParcels ?? []).map((parcel, i) => (
              <div
                key={i}
                className="border border-black/10 p-3 grid sm:grid-cols-3 gap-3 relative"
              >
                <Field label="Exposure">
                  <input
                    value={parcel.exposure}
                    onChange={(e) =>
                      updateParcel(i, "exposure", e.target.value)
                    }
                    className="input"
                    placeholder="e.g. West"
                  />
                </Field>
                <Field label="Soil">
                  <input
                    value={parcel.soil}
                    onChange={(e) => updateParcel(i, "soil", e.target.value)}
                    className="input"
                    placeholder="e.g. Formazione di Lequio, clayey marl"
                  />
                </Field>
                <Field label="Average age">
                  <input
                    value={parcel.averageAge}
                    onChange={(e) =>
                      updateParcel(i, "averageAge", e.target.value)
                    }
                    className="input"
                    placeholder="e.g. 15 years old"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => removeParcel(i)}
                  className="absolute top-2 right-2 text-xs text-ink/40 hover:text-black"
                  title="Remove parcel"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cellar */}
      <section className="bg-white border border-black/10 p-6 grid gap-4">
        <h2 className="font-medium">In the Cellar</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Fermentation">
            <input
              value={form.fermentation}
              onChange={(e) => set("fermentation", e.target.value)}
              className="input"
              placeholder="e.g. Steel tank, controlled temperature"
            />
          </Field>
          <Field label="Maceration">
            <input
              value={form.maceration}
              onChange={(e) => set("maceration", e.target.value)}
              className="input"
              placeholder="e.g. 10–14 days on the skins"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Aged in">
            <select
              value={form.agingVessel}
              onChange={(e) =>
                set("agingVessel", e.target.value as AgingVessel)
              }
              className="input"
            >
              <option value="steel">Steel tank</option>
              <option value="barrel">Oak barrel</option>
            </select>
          </Field>
          {form.agingVessel === "barrel" && (
            <Field label="Barrel size">
              <select
                value={form.barrelSize ?? ""}
                onChange={(e) =>
                  set(
                    "barrelSize",
                    (e.target.value || undefined) as BarrelSize | undefined
                  )
                }
                className="input"
              >
                <option value="">Select a size…</option>
                {BARREL_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <Field label="Ageing notes">
          <input
            value={form.agingNotes}
            onChange={(e) => set("agingNotes", e.target.value)}
            className="input"
            placeholder="e.g. 12 months before release"
          />
        </Field>
      </section>

      {/* Experience */}
      <section className="bg-white border border-black/10 p-6 grid gap-4">
        <h2 className="font-medium">Tasting Experience</h2>
        <Field label="What to expect">
          <textarea
            rows={4}
            value={form.experienceDescription}
            onChange={(e) => set("experienceDescription", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Serving & pairing">
          <textarea
            rows={3}
            value={form.pairingText}
            onChange={(e) => set("pairingText", e.target.value)}
            className="input"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Alcohol %">
            <input
              value={form.abv}
              onChange={(e) => set("abv", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Serving temperature">
            <input
              value={form.servingTemp}
              onChange={(e) => set("servingTemp", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <p className="text-xs text-ink/50">
          In production, each of these text fields is entered once per
          language (EN / NL / DE / FR / IT) with a language tab here.
        </p>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-black text-white px-6 py-2.5 text-sm hover:opacity-90"
        >
          {wineId ? "Save changes" : "Add wine"}
        </button>
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
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink/70">{label}</span>
      {children}
    </label>
  );
}
