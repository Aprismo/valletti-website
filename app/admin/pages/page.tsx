"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAdminStore, MediaItem } from "@/lib/admin-store";
import {
  PAGE_TEXT_FIELDS,
  defaultPageText,
  pageTextKey,
} from "@/data/page-fields";

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
    fields: PAGE_TEXT_FIELDS.home,
    images: [
      { key: "home.heroBackground", label: "Hero background photo (behind the “Valletti” title)" },
      { key: "home.philosophyTeaser", label: "Philosophy teaser image" },
    ],
  },
  {
    key: "winery",
    label: "The Winery",
    fields: PAGE_TEXT_FIELDS.winery,
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
    fields: PAGE_TEXT_FIELDS.about,
    images: [
      { key: "about.history", label: "History photo (1958)" },
      { key: "about.today", label: "Estate today photo" },
      { key: "about.roberto", label: "Roberto portrait" },
    ],
  },
  {
    key: "visit",
    label: "Visit",
    // Opening Hours, per language. No pictures on this page.
    fields: PAGE_TEXT_FIELDS.visit,
    images: [] as { key: string; label: string }[],
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
  const { media, pageImages, pageText, addMedia, setPageImage, setPageText, mediaUrl, flushSaves } =
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

  // onBlur bubbles up from every field: leaving a field saves it at once.
  return (
    <div onBlur={flushSaves}>
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

      <>
          {/* Pictures for this page */}
          {page.images.length > 0 && (
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
          )}

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
              <span className="text-xs text-ink/40">
                Editing the {LANGS.find((l) => l.code === lang)?.label} version. Changes
                save automatically and are live on the site.
              </span>
            </div>

            <div className="grid gap-5">
              {page.fields.map((f) => {
                const textKey = pageTextKey(lang, page.key, f.key);
                const value = pageText[textKey] ?? defaultPageText(lang, page.key, f.key);
                const english = defaultPageText("en", page.key, f.key);
                return (
                  <label key={textKey} className="flex flex-col gap-1 text-sm">
                    <span className="text-ink/70">{f.label}</span>
                    {f.multiline ? (
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={english}
                        onChange={(e) => setPageText(textKey, e.target.value)}
                        className="input"
                      />
                    ) : (
                      <input
                        value={value}
                        placeholder={english}
                        onChange={(e) => setPageText(textKey, e.target.value)}
                        className="input"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </>

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
