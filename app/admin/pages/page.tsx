"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import en from "@/messages/en.json";
import { useAdminStore, MediaItem } from "@/lib/admin-store";

const LANGS = [
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

const PAGES = [
  {
    key: "home",
    label: "Home",
    fields: [
      { key: "introTitle", label: "Intro title", value: en.home.introTitle },
      { key: "introText", label: "Intro text", value: en.home.introText, multiline: true },
    ],
    images: [
      { key: "home.heroBackground", label: "Hero background photo (behind the “Valletti” title)" },
      { key: "home.philosophyTeaser", label: "Philosophy teaser image" },
    ],
  },
  {
    key: "winery",
    label: "The Winery",
    fields: [
      { key: "openingLine", label: "Opening line (hero)", value: en.winery.openingLine, multiline: true },
      { key: "philosophyQuote", label: "Philosophy pull-quote", value: en.winery.philosophyQuote, multiline: true },
      { key: "vineyardTitle", label: "Vineyard section title", value: en.winery.vineyardTitle },
      { key: "vineyardText1", label: "Vineyard — paragraph 1", value: en.winery.vineyardText1, multiline: true },
      { key: "vineyardText2", label: "Vineyard — paragraph 2", value: en.winery.vineyardText2, multiline: true },
      { key: "harvestTitle", label: "Harvest section title", value: en.winery.harvestTitle },
      { key: "harvestText1", label: "Harvest — paragraph 1", value: en.winery.harvestText1, multiline: true },
      { key: "harvestText2", label: "Harvest — paragraph 2", value: en.winery.harvestText2, multiline: true },
      { key: "cellarTitle", label: "Cellar section title", value: en.winery.cellarTitle },
      { key: "cellarText1", label: "Cellar — paragraph 1", value: en.winery.cellarText1, multiline: true },
      { key: "cellarText2", label: "Cellar — paragraph 2", value: en.winery.cellarText2, multiline: true },
      { key: "closingQuote", label: "Closing pull-quote", value: en.winery.closingQuote, multiline: true },
      { key: "closingText", label: "Closing paragraph", value: en.winery.closingText, multiline: true },
    ],
    images: [
      { key: "winery.philosophy", label: "Philosophy portrait" },
      { key: "winery.vineyard", label: "Vineyard section image" },
      { key: "winery.harvest", label: "Harvest section image" },
      { key: "winery.cellar", label: "Cellar section image" },
    ],
  },
  {
    key: "about",
    label: "About Valletti",
    fields: [
      { key: "historyTitle", label: "History title", value: en.about.historyTitle },
      { key: "historyText", label: "History text", value: en.about.historyText, multiline: true },
      { key: "todayTitle", label: "Today title", value: en.about.todayTitle },
      { key: "todayText", label: "Today text", value: en.about.todayText, multiline: true },
    ],
    images: [
      { key: "about.history", label: "History photo (1958)" },
      { key: "about.today", label: "Estate today photo" },
      { key: "about.roberto", label: "Roberto portrait" },
    ],
  },
  {
    key: "visit",
    label: "Visit",
    // No translated fields/pictures here — this page's editable content
    // (Opening Hours) is handled separately below, since it saves for
    // real via useAdminStore instead of being demo-only.
    fields: [],
    images: [],
  },
];

function PageImageSlot({
  label,
  url,
  media,
  selectedMediaId,
  isPickerOpen,
  onTogglePicker,
  onChoose,
  onUploadClick,
}: {
  label: string;
  url: string | undefined;
  media: MediaItem[];
  selectedMediaId: string | undefined;
  isPickerOpen: boolean;
  onTogglePicker: () => void;
  onChoose: (mediaId: string) => void;
  onUploadClick: () => void;
}) {
  return (
    <div>
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-2">
        {url && <Image src={url} alt={label} fill className="object-cover" />}
      </div>
      <p className="text-xs text-ink/70 mb-2">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTogglePicker}
          className="text-xs border border-black text-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          Choose
        </button>
        <button
          type="button"
          onClick={onUploadClick}
          className="text-xs border border-black/15 px-2 py-1 hover:border-black/30"
        >
          Upload
        </button>
      </div>
      {isPickerOpen && (
        <div className="mt-2 grid grid-cols-3 gap-2 bg-neutral-100 p-3 max-h-96 overflow-y-auto">
          {media.map((m) => {
            const isSelected = m.id === selectedMediaId;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => onChoose(m.id)}
                className={`relative aspect-[3/4] overflow-hidden border-2 shrink-0 ${
                  isSelected ? "border-black" : "border-transparent hover:border-black/40"
                }`}
                title={m.fileName}
              >
                <Image src={m.url} alt={m.fileName} fill sizes="140px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminPagesEditor() {
  const [activePage, setActivePage] = useState(PAGES[0].key);
  const [lang, setLang] = useState("en");
  const [saved, setSaved] = useState(false);
  const { media, pageImages, pageText, addMedia, setPageImage, setPageText, mediaUrl } =
    useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const page = PAGES.find((p) => p.key === activePage)!;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const item = await addMedia(file);
    setPageImage(uploadTarget, item.id);
    e.target.value = "";
    setUploadTarget(null);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-black mb-1">Page Content</h1>
      <p className="text-ink/60 text-sm mb-6">
        Edit the text and pictures that appear on Home, The Winery and About
        Valletti. Write everything in English first — that&rsquo;s the site&rsquo;s
        main language — then switch tabs to add each translation.
      </p>

      <div className="flex gap-2 mb-4">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-4 py-2 text-sm border ${
              activePage === p.key
                ? "bg-black text-white border-black"
                : "bg-white border-black/10 hover:border-black/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activePage === "visit" ? (
        <div className="bg-white border border-black/10 p-6">
          <h2 className="font-medium mb-1">Opening Hours</h2>
          <p className="text-xs text-ink/50 mb-4">
            Shown on the Visit page. Changes here save right away and are
            live on the site — no separate Save button needed.
          </p>
          <div className="grid gap-5 max-w-lg">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Title</span>
              <input
                className="input"
                value={pageText["visit.openingHoursTitle"] ?? ""}
                onChange={(e) => setPageText("visit.openingHoursTitle", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink/70">Hours &amp; visit info</span>
              <textarea
                rows={4}
                className="input"
                value={pageText["visit.openingHoursText"] ?? ""}
                onChange={(e) => setPageText("visit.openingHoursText", e.target.value)}
              />
            </label>
          </div>
        </div>
      ) : (
        <>
          {/* Pictures for this page */}
          <div className="bg-white border border-black/10 p-6 mb-6">
            <h2 className="font-medium mb-1">Pictures</h2>
            <p className="text-xs text-ink/50 mb-4">
              Pictures aren&rsquo;t translated — the same image is used across
              all languages. Choose one from your media library or upload a
              new one.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {page.images.map((img) => (
                <PageImageSlot
                  key={img.key}
                  label={img.label}
                  url={mediaUrl(pageImages[img.key])}
                  media={media}
                  selectedMediaId={pageImages[img.key]}
                  isPickerOpen={pickerFor === img.key}
                  onTogglePicker={() =>
                    setPickerFor((prev) => (prev === img.key ? null : img.key))
                  }
                  onChoose={(mediaId) => {
                    setPageImage(img.key, mediaId);
                    setPickerFor(null);
                  }}
                  onUploadClick={() => {
                    setUploadTarget(img.key);
                    fileInputRef.current?.click();
                  }}
                />
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          <div className="bg-white border border-black/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 text-xs">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 uppercase tracking-wide ${
                      lang === l.code
                        ? "bg-neutral-200 text-black font-medium"
                        : "text-ink/50 hover:text-ink"
                    }`}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
              {lang !== "en" && (
                <span className="text-xs text-ink/40">
                  Showing English as reference — enter the {LANGS.find((l) => l.code === lang)?.label} translation below.
                </span>
              )}
            </div>

            <div className="grid gap-5">
              {page.fields.map((f) => (
                <label key={f.key} className="flex flex-col gap-1 text-sm">
                  <span className="text-ink/70">{f.label}</span>
                  {f.multiline ? (
                    <textarea
                      rows={4}
                      defaultValue={lang === "en" ? f.value : ""}
                      placeholder={lang !== "en" ? f.value : undefined}
                      className="input"
                    />
                  ) : (
                    <input
                      defaultValue={lang === "en" ? f.value : ""}
                      placeholder={lang !== "en" ? f.value : undefined}
                      className="input"
                    />
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="mt-6 bg-black text-white px-6 py-2.5 text-sm hover:opacity-90"
            >
              Save changes
            </button>
            {saved && (
              <span className="ml-3 text-sm text-green-700">Saved (demo only).</span>
            )}
          </div>
        </>
      )}

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
