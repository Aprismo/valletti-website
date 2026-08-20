"use client";

/**
 * In-memory admin store for the PROTOTYPE only.
 *
 * This lets Roberto's admin screens be fully clickable (add/edit/delete
 * wines, upload/delete pictures, edit retailers and closures) without a
 * real backend wired up yet.
 *
 * Uploaded pictures and picture choices (media + pageImages) are mirrored
 * into the browser's localStorage, so they survive a page reload or
 * opening the site in a new tab on the same computer — a stand-in for a
 * real database until Supabase is wired up. Wines/retailers/closures are
 * NOT persisted (they reset on reload), since those already have a full
 * add/edit UI that's easy to redo and keeping the demo simple matters
 * more there.
 *
 * In production, every function here (addWine, deleteMedia, etc.) is
 * replaced with a Supabase call — see /supabase/schema.sql for the exact
 * tables this maps to, and /lib/supabase for client setup.
 *
 * Key design point requested by Valletti: pictures live in their own
 * media library, independent of wines. Adding/removing a wine never
 * deletes a picture; deleting a picture is a separate, explicit action
 * that warns if the picture is still in use by a wine.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Wine, Retailer, ClosurePeriod } from "@/types";
import { wines as seedWines } from "@/data/wines";
import { retailers as seedRetailers } from "@/data/retailers";
import { closures as seedClosures } from "@/data/closures";
import en from "@/messages/en.json";

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

interface AdminWine extends Wine {
  imageMediaId: string;
}

interface AdminState {
  wines: AdminWine[];
  media: MediaItem[];
  retailers: Retailer[];
  closures: ClosurePeriod[];
  pageImages: Record<string, string>; // section key -> media id
  pageText: Record<string, string>; // text key -> current value (English only for now)
}

interface AdminContextValue extends AdminState {
  addWine: (wine: Omit<AdminWine, "id">) => void;
  updateWine: (id: string, wine: Partial<AdminWine>) => void;
  deleteWine: (id: string) => void;
  addMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => { ok: boolean; usedBy: string[] };
  addRetailer: (r: Omit<Retailer, "id">) => void;
  deleteRetailer: (id: string) => void;
  addClosure: (c: Omit<ClosurePeriod, "id">) => void;
  updateClosure: (id: string, c: Partial<ClosurePeriod>) => void;
  deleteClosure: (id: string) => void;
  wineCountUsingMedia: (mediaId: string) => number;
  setPageImage: (sectionKey: string, mediaId: string) => void;
  mediaUrl: (mediaId: string | undefined) => string | undefined;
  setPageText: (textKey: string, value: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// Section-image placeholders matching what the live public pages currently
// show (see /data below and app/[locale]/{home,the-winery,about}/page.tsx).
// Pre-seeding these into the media library means Roberto's very first visit
// to Page Content already has real pickable thumbnails, not an empty grid.
//
// These are local files under /public/placeholders (not placehold.co) —
// that external service doesn't reliably load on every network, which
// showed up as broken-image icons in the media picker.
const PAGE_SECTION_SEEDS: { key: string; fileName: string; url: string }[] = [
  {
    key: "home.heroBackground",
    fileName: "pianezzo-vineyard.jpg",
    url: "/placeholders/home-hero-background.jpg",
  },
  {
    key: "home.philosophyTeaser",
    fileName: "roberto-vineyard-teaser.jpg",
    url: "/placeholders/home-philosophy-teaser.jpg",
  },
  {
    key: "winery.philosophy",
    fileName: "roberto-in-cellar.jpg",
    url: "/placeholders/winery-philosophy.jpg",
  },
  {
    key: "winery.vineyard",
    fileName: "the-vineyard.jpg",
    url: "/placeholders/winery-vineyard.jpg",
  },
  {
    key: "winery.harvest",
    fileName: "harvest.jpg",
    url: "/placeholders/winery-harvest.jpg",
  },
  {
    key: "winery.cellar",
    fileName: "the-cellar.jpg",
    url: "/placeholders/winery-cellar.jpg",
  },
  {
    key: "about.history",
    fileName: "estate-1958.jpg",
    url: "/placeholders/about-history.jpg",
  },
  {
    key: "about.today",
    fileName: "estate-today.jpg",
    url: "/placeholders/about-today.jpg",
  },
  {
    key: "about.roberto",
    fileName: "roberto-valletti.jpg",
    url: "/team/roberto-valletti.jpg",
  },
];

// Extra photos already uploaded/available on disk but not assigned to any
// specific wine or page section — they just need to show up in the Media
// Library so Roberto (or whoever's managing the site) can pick them for
// whatever they fit. Add more entries here as new photos come in outside
// the normal in-app Upload flow.
const EXTRA_MEDIA_SEEDS: { id: string; fileName: string; url: string }[] = [
  {
    id: "media-extra-roberto-furgone",
    fileName: "roberto-furgone-cassette.jpg",
    url: "/uploads/1785169848790-Billede-07.02.2024-kl.-19.04.jpg",
  },
];

function seedMedia(): MediaItem[] {
  const wineMedia = seedWines.map((w) => ({
    id: `media-${w.id}`,
    url: w.imageUrl,
    fileName: `${w.slug}.jpg`,
    uploadedAt: "2026-01-15",
  }));
  const pageMedia = PAGE_SECTION_SEEDS.map((s) => ({
    id: `media-page-${s.key}`,
    url: s.url,
    fileName: s.fileName,
    uploadedAt: "2026-01-15",
  }));
  const extraMedia = EXTRA_MEDIA_SEEDS.map((s) => ({
    id: s.id,
    url: s.url,
    fileName: s.fileName,
    uploadedAt: "2026-08-19",
  }));
  return [...wineMedia, ...pageMedia, ...extraMedia];
}

function seedPageImages(): Record<string, string> {
  return Object.fromEntries(
    PAGE_SECTION_SEEDS.map((s) => [s.key, `media-page-${s.key}`])
  );
}

// Editable site text that Roberto can change from /admin/pages, starting
// with just Opening Hours (see PageText component + the Visit page).
// English only for now — same limitation as pictures, which also aren't
// per-language. Defaults come from messages/en.json.
function seedPageText(): Record<string, string> {
  return {
    "visit.openingHoursTitle": en.visit.openingHoursTitle,
    "visit.openingHoursText": en.visit.openingHoursText,
  };
}

function seedAdminWines(): AdminWine[] {
  return seedWines.map((w) => ({ ...w, imageMediaId: `media-${w.id}` }));
}

let idCounter = 1000;
function nextId() {
  idCounter += 1;
  // Timestamp + counter, so ids stay unique even across a page reload —
  // a plain incrementing counter restarts at 1000 every reload and can
  // collide with ids already saved in localStorage from a previous
  // session (this caused "Choose" to silently misbehave on duplicate
  // picture ids).
  return `${Date.now().toString(36)}-${idCounter}`;
}

// --- localStorage persistence for pictures + editable text (see file header) ---
const MEDIA_STORAGE_KEY = "valletti-admin-media-v1";
const PAGE_IMAGES_STORAGE_KEY = "valletti-admin-page-images-v1";
const PAGE_TEXT_STORAGE_KEY = "valletti-admin-page-text-v1";

function loadStoredMedia(): MediaItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) return null;
    const items = JSON.parse(raw) as MediaItem[];
    // Self-heal: older versions of this store could save duplicate ids
    // across reloads (a "Choose" click on one of the duplicates would
    // silently do nothing). Keep the first occurrence of each id.
    const seen = new Set<string>();
    return items.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  } catch {
    return null;
  }
}

function loadStoredPageImages(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAGE_IMAGES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function loadStoredPageText(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAGE_TEXT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

// Reads an uploaded file, shrinks it, and uploads it to /api/admin/upload,
// which saves it as a REAL file under /public/uploads and returns its
// permanent URL. This is what actually fixed pictures "disappearing":
// the earlier version only kept pictures as data URLs in localStorage,
// which a bug could (and did) wipe. A real file on disk can't be lost
// that way — only the small bit of metadata (which section uses which
// picture) still lives in localStorage, and that's cheap to lose and
// redo. Local dev only — see the note in that route for why.
function uploadFile(file: File, maxDim = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (Math.max(width, height) > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported in this browser"));
          return;
        }
        // White backdrop so transparent PNGs don't turn black as JPEGs.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Could not process this image"));
              return;
            }
            try {
              const jpegName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
              const body = new FormData();
              body.append("file", blob, jpegName);
              const res = await fetch("/api/admin/upload", { method: "POST", body });
              if (!res.ok) throw new Error("Upload failed");
              const data = (await res.json()) as { url: string };
              resolve(data.url);
            } catch (err) {
              reject(err instanceof Error ? err : new Error("Upload failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Could not read this image"));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [wines, setWines] = useState<AdminWine[]>(seedAdminWines);
  const [media, setMedia] = useState<MediaItem[]>(seedMedia);
  const [retailers, setRetailers] = useState<Retailer[]>(seedRetailers);
  const [closures, setClosures] = useState<ClosurePeriod[]>(seedClosures);
  const [pageImages, setPageImages] = useState<Record<string, string>>(seedPageImages);
  const [pageText, setPageTextState] = useState<Record<string, string>>(seedPageText);

  // Hydrate from localStorage after mount (kept out of the initial
  // useState so server and first client render match, avoiding a
  // hydration warning — this runs once, right after). Reading an
  // external, browser-only store (localStorage) on mount and syncing it
  // into state is the standard pattern for this; it runs once ([]) and
  // does not cascade, so the two setState calls below are intentional.
  //
  // hasHydrated guards the two "persist" effects below from firing
  // before this one has actually finished restoring saved pictures.
  // Without it, on every mount the persist effects would run once with
  // the seed data (their normal mount-time run) and briefly overwrite
  // real saved pictures in localStorage with the defaults, a heartbeat
  // before this effect's restore caught up — a page reload landing in
  // that window would permanently wipe real pictures back to the seed
  // set. This was a real bug, now fixed.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedMedia = loadStoredMedia();
    if (storedMedia) {
      // A browser that already has saved picks (from a previous session)
      // would otherwise fully replace the seed list here — meaning a photo
      // added later in code (e.g. EXTRA_MEDIA_SEEDS) would never show up
      // for that browser. Merge instead: keep everything already saved,
      // and add any seed photo not already present by id.
      const storedIds = new Set(storedMedia.map((m) => m.id));
      const missingSeeds = seedMedia().filter((m) => !storedIds.has(m.id));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMedia([...missingSeeds, ...storedMedia]);
    }
    const storedPageImages = loadStoredPageImages();
    if (storedPageImages) setPageImages(storedPageImages);
    const storedPageText = loadStoredPageText();
    if (storedPageText) setPageTextState((prev) => ({ ...prev, ...storedPageText }));
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
    } catch {
      // Storage full or unavailable (e.g. private browsing) — picture
      // still works for the rest of this session, just won't persist.
    }
  }, [media, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(PAGE_IMAGES_STORAGE_KEY, JSON.stringify(pageImages));
    } catch {
      // See note above.
    }
  }, [pageImages, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(PAGE_TEXT_STORAGE_KEY, JSON.stringify(pageText));
    } catch {
      // See note above.
    }
  }, [pageText, hasHydrated]);

  const value = useMemo<AdminContextValue>(
    () => ({
      wines,
      media,
      retailers,
      closures,
      pageImages,
      pageText,
      setPageImage: (sectionKey, mediaId) =>
        setPageImages((prev) => ({ ...prev, [sectionKey]: mediaId })),
      setPageText: (textKey, val) =>
        setPageTextState((prev) => ({ ...prev, [textKey]: val })),
      mediaUrl: (mediaId) => media.find((m) => m.id === mediaId)?.url,
      addWine: (wine) => setWines((prev) => [...prev, { ...wine, id: nextId() }]),
      updateWine: (id, patch) =>
        setWines((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w))),
      deleteWine: (id) => setWines((prev) => prev.filter((w) => w.id !== id)),
      addMedia: async (file) => {
        // Saved as a real file under /public/uploads (see uploadFile
        // above) — not a fake placeholder, not a blob URL, not just
        // localStorage. In production this is replaced with a real
        // upload to Supabase Storage.
        const url = await uploadFile(file);
        const item: MediaItem = {
          id: `media-${nextId()}`,
          url,
          fileName: file.name,
          uploadedAt: new Date().toISOString().slice(0, 10),
        };
        setMedia((prev) => [item, ...prev]);
        return item;
      },
      deleteMedia: (id) => {
        const usedBy = wines.filter((w) => w.imageMediaId === id).map((w) => w.name);
        if (usedBy.length > 0) return { ok: false, usedBy };
        setMedia((prev) => prev.filter((m) => m.id !== id));
        return { ok: true, usedBy: [] };
      },
      addRetailer: (r) =>
        setRetailers((prev) => [...prev, { ...r, id: nextId() }]),
      deleteRetailer: (id) =>
        setRetailers((prev) => prev.filter((r) => r.id !== id)),
      addClosure: (c) =>
        setClosures((prev) => [...prev, { ...c, id: nextId() }]),
      updateClosure: (id, patch) =>
        setClosures((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      deleteClosure: (id) =>
        setClosures((prev) => prev.filter((c) => c.id !== id)),
      wineCountUsingMedia: (mediaId) =>
        wines.filter((w) => w.imageMediaId === mediaId).length,
    }),
    [wines, media, retailers, closures, pageImages, pageText]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
