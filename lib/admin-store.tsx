"use client";

/**
 * Shared site/admin state.
 *
 * The root layout loads all content on the server (lib/data.ts) and hands
 * it to this provider as `initialData`, so public components (PageImage,
 * PageText, BrandMark, SiteTheme...) render the saved content straight
 * away, and the admin screens start from the same data.
 *
 * Two modes:
 *  - Supabase configured (production): every admin change is written to
 *    Supabase first, and only shown once it has saved. Pictures are
 *    uploaded to the `media` storage bucket. Row-level security in
 *    supabase/schema.sql makes sure only a signed-in admin can write.
 *  - No Supabase (local dev): the original prototype behaviour — changes
 *    live in memory, pictures/page content/design are mirrored into
 *    localStorage, and uploads are saved under /public/uploads.
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
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  AdminWine,
  ClosurePeriod,
  MediaItem,
  Retailer,
  SiteData,
  SiteSettings,
} from "@/types";
import { seedMedia } from "@/data/seed";
import { DEFAULT_SITE_SETTINGS } from "@/data/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { toRow } from "@/lib/db-mapping";

export type { MediaItem } from "@/types";

interface AdminState {
  wines: AdminWine[];
  media: MediaItem[];
  retailers: Retailer[];
  closures: ClosurePeriod[];
  pageImages: Record<string, string>; // section key -> media id
  pageText: Record<string, string>; // text key -> current value (English only for now)
  siteSettings: SiteSettings; // design profile: name, logo, colors, fonts, address
}

interface AdminContextValue extends AdminState {
  addWine: (wine: Omit<AdminWine, "id">) => Promise<boolean>;
  updateWine: (id: string, wine: Partial<AdminWine>) => Promise<boolean>;
  deleteWine: (id: string) => Promise<boolean>;
  addMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => { ok: boolean; usedBy: string[] };
  addRetailer: (r: Omit<Retailer, "id">) => Promise<boolean>;
  deleteRetailer: (id: string) => Promise<boolean>;
  addClosure: (c: Omit<ClosurePeriod, "id">) => Promise<boolean>;
  updateClosure: (id: string, c: Partial<ClosurePeriod>) => Promise<boolean>;
  deleteClosure: (id: string) => Promise<boolean>;
  wineCountUsingMedia: (mediaId: string) => number;
  setPageImage: (sectionKey: string, mediaId: string) => void;
  mediaUrl: (mediaId: string | undefined) => string | undefined;
  setPageText: (textKey: string, value: string) => void;
  updateSiteSettings: (patch: Partial<SiteSettings>) => void;
  setLogo: (file: File) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// How long to wait after the last keystroke / color change before saving
// text fields and the design profile to Supabase.
const SAVE_DELAY_MS = 800;

type DbResult = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/**
 * Runs one Supabase write. Returns true on success. On failure, tells the
 * admin with an alert and returns false, so the caller leaves the screen
 * unchanged. In local mode (no Supabase) this is a no-op that succeeds.
 *
 * Every write must end in `.select(...)` so it returns the rows it
 * touched: when row-level security blocks an update or delete (e.g. the
 * session expired, or the user isn't in `admins`), Supabase reports no
 * error, just 0 rows — so 0 rows is treated as a failure too.
 */
async function save(what: string, write: () => DbResult): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { data, error } = await write();
  if (error || !data || data.length === 0) {
    window.alert(
      `Could not save ${what}: ${
        error?.message ?? "not allowed or not found — try signing out and in again."
      }`
    );
    return false;
  }
  return true;
}

const db = () => createClient();

// --- localStorage persistence (local mode only, see file header) ---
const MEDIA_STORAGE_KEY = "valletti-admin-media-v1";
const PAGE_IMAGES_STORAGE_KEY = "valletti-admin-page-images-v1";
const PAGE_TEXT_STORAGE_KEY = "valletti-admin-page-text-v1";
const SITE_SETTINGS_STORAGE_KEY = "valletti-admin-site-settings-v1";

function loadStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function storeLocally(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — the change
    // still works for the rest of this session, it just won't persist.
  }
}

function loadStoredMedia(): MediaItem[] | null {
  const items = loadStored<MediaItem[]>(MEDIA_STORAGE_KEY);
  if (!items) return null;
  // Self-heal: older versions could save duplicate ids. Keep the first.
  const seen = new Set<string>();
  return items.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

/**
 * Shrinks an image in the browser (max `maxDim` px, JPEG) and uploads it.
 * - Supabase mode: to the `media` storage bucket; returns its public URL.
 * - Local mode: to /api/admin/upload, which saves it under /public/uploads.
 */
function uploadFile(
  file: File,
  maxDim = 1400,
  quality = 0.85
): Promise<{ url: string; storagePath?: string }> {
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
              const baseName = file.name.replace(/\.[^.]+$/, "");
              const jpegName = baseName + ".jpg";

              if (isSupabaseConfigured) {
                const safeName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
                const storagePath = `${Date.now()}-${safeName}.jpg`;
                const bucket = db().storage.from("media");
                const { error } = await bucket.upload(storagePath, blob, {
                  contentType: "image/jpeg",
                });
                if (error) throw new Error(error.message);
                const { data } = bucket.getPublicUrl(storagePath);
                resolve({ url: data.publicUrl, storagePath });
                return;
              }

              const body = new FormData();
              body.append("file", blob, jpegName);
              const res = await fetch("/api/admin/upload", { method: "POST", body });
              if (!res.ok) throw new Error("Upload failed");
              const data = (await res.json()) as { url: string };
              resolve({ url: data.url });
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

async function uploadOrAlert(file: File, maxDim?: number, quality?: number) {
  try {
    return await uploadFile(file, maxDim, quality);
  } catch (err) {
    window.alert(`Could not upload "${file.name}": ${err instanceof Error ? err.message : err}`);
    throw err;
  }
}

export function AdminStoreProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: SiteData;
}) {
  const [wines, setWines] = useState<AdminWine[]>(initialData.wines);
  const [media, setMedia] = useState<MediaItem[]>(initialData.media);
  const [retailers, setRetailers] = useState<Retailer[]>(initialData.retailers);
  const [closures, setClosures] = useState<ClosurePeriod[]>(initialData.closures);
  const [pageImages, setPageImages] = useState<Record<string, string>>(initialData.pageImages);
  const [pageText, setPageTextState] = useState<Record<string, string>>(initialData.pageText);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialData.siteSettings);

  // Debounced saves for fields that change on every keystroke.
  const textTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSettings = useRef<Partial<SiteSettings>>({});

  // ── Local mode only: restore/mirror browser-saved changes ──────────
  // Restored after mount (not in the initial useState) so the server and
  // first client render match. hasHydrated stops the mirror effects from
  // overwriting saved values with the defaults before the restore ran.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    const storedMedia = loadStoredMedia();
    if (storedMedia) {
      // Merge: keep everything saved, add any seed photo not yet present.
      const storedIds = new Set(storedMedia.map((m) => m.id));
      const missingSeeds = seedMedia().filter((m) => !storedIds.has(m.id));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMedia([...missingSeeds, ...storedMedia]);
    }
    const storedPageImages = loadStored<Record<string, string>>(PAGE_IMAGES_STORAGE_KEY);
    if (storedPageImages) setPageImages(storedPageImages);
    const storedPageText = loadStored<Record<string, string>>(PAGE_TEXT_STORAGE_KEY);
    if (storedPageText) setPageTextState((prev) => ({ ...prev, ...storedPageText }));
    const storedSettings = loadStored<Partial<SiteSettings>>(SITE_SETTINGS_STORAGE_KEY);
    if (storedSettings) setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...storedSettings });
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) storeLocally(MEDIA_STORAGE_KEY, media);
  }, [media, hasHydrated]);
  useEffect(() => {
    if (hasHydrated) storeLocally(PAGE_IMAGES_STORAGE_KEY, pageImages);
  }, [pageImages, hasHydrated]);
  useEffect(() => {
    if (hasHydrated) storeLocally(PAGE_TEXT_STORAGE_KEY, pageText);
  }, [pageText, hasHydrated]);
  useEffect(() => {
    if (hasHydrated) storeLocally(SITE_SETTINGS_STORAGE_KEY, siteSettings);
  }, [siteSettings, hasHydrated]);

  const value = useMemo<AdminContextValue>(() => {
    function queueSettingsSave(patch: Partial<SiteSettings>) {
      if (!isSupabaseConfigured) return;
      pendingSettings.current = { ...pendingSettings.current, ...patch };
      if (settingsTimer.current) clearTimeout(settingsTimer.current);
      settingsTimer.current = setTimeout(() => {
        const changes = pendingSettings.current;
        pendingSettings.current = {};
        void save("the design settings", () =>
          db().from("site_settings").update(toRow(changes)).eq("id", 1).select("id")
        );
      }, SAVE_DELAY_MS);
    }

    return {
      wines,
      media,
      retailers,
      closures,
      pageImages,
      pageText,
      siteSettings,

      setPageImage: (sectionKey, mediaId) => {
        setPageImages((prev) => ({ ...prev, [sectionKey]: mediaId }));
        void save("the page picture", () =>
          db().from("page_content").upsert({ key: sectionKey, kind: "image", value: mediaId }).select("key")
        );
      },

      setPageText: (textKey, val) => {
        setPageTextState((prev) => ({ ...prev, [textKey]: val }));
        if (!isSupabaseConfigured) return;
        clearTimeout(textTimers.current[textKey]);
        textTimers.current[textKey] = setTimeout(() => {
          void save("the page text", () =>
            db().from("page_content").upsert({ key: textKey, kind: "text", value: val }).select("key")
          );
        }, SAVE_DELAY_MS);
      },

      updateSiteSettings: (patch) => {
        setSiteSettings((prev) => ({ ...prev, ...patch }));
        queueSettingsSave(patch);
      },

      setLogo: async (file) => {
        const { url } = await uploadOrAlert(file, 800, 0.92);
        setSiteSettings((prev) => ({ ...prev, logoUrl: url }));
        queueSettingsSave({ logoUrl: url });
      },

      mediaUrl: (mediaId) => media.find((m) => m.id === mediaId)?.url,

      addWine: async (wine) => {
        const row = { ...wine, id: crypto.randomUUID() };
        const ok = await save("the wine", () => db().from("wines").insert(toRow(row)).select("id"));
        if (ok) setWines((prev) => [...prev, row]);
        return ok;
      },

      updateWine: async (id, patch) => {
        const ok = await save("the wine", () =>
          db().from("wines").update(toRow({ ...patch, id })).eq("id", id).select("id")
        );
        if (ok) setWines((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
        return ok;
      },

      deleteWine: async (id) => {
        const ok = await save("the change", () => db().from("wines").delete().eq("id", id).select("id"));
        if (ok) setWines((prev) => prev.filter((w) => w.id !== id));
        return ok;
      },

      addMedia: async (file) => {
        const { url, storagePath } = await uploadOrAlert(file);
        const item: MediaItem = {
          id: crypto.randomUUID(),
          url,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          storagePath,
        };
        const ok = await save("the picture", () => db().from("media_items").insert(toRow(item)).select("id"));
        if (!ok) {
          if (storagePath) void db().storage.from("media").remove([storagePath]);
          throw new Error("Could not save the picture");
        }
        setMedia((prev) => [item, ...prev]);
        return item;
      },

      deleteMedia: (id) => {
        const usedBy = wines.filter((w) => w.imageMediaId === id).map((w) => w.name);
        if (usedBy.length > 0) return { ok: false, usedBy };
        const item = media.find((m) => m.id === id);
        void (async () => {
          const ok = await save("the change", () => db().from("media_items").delete().eq("id", id).select("id"));
          if (!ok) return;
          setMedia((prev) => prev.filter((m) => m.id !== id));
          if (isSupabaseConfigured && item?.storagePath) {
            await db().storage.from("media").remove([item.storagePath]);
          }
        })();
        return { ok: true, usedBy: [] };
      },

      addRetailer: async (r) => {
        const row = { ...r, id: crypto.randomUUID() };
        const ok = await save("the retailer", () => db().from("retailers").insert(toRow(row)).select("id"));
        if (ok) setRetailers((prev) => [...prev, row]);
        return ok;
      },

      deleteRetailer: async (id) => {
        const ok = await save("the change", () => db().from("retailers").delete().eq("id", id).select("id"));
        if (ok) setRetailers((prev) => prev.filter((r) => r.id !== id));
        return ok;
      },

      addClosure: async (c) => {
        const row = { ...c, id: crypto.randomUUID() };
        const ok = await save("the closure period", () =>
          db().from("closure_periods").insert(toRow(row)).select("id")
        );
        if (ok) setClosures((prev) => [...prev, row]);
        return ok;
      },

      updateClosure: async (id, patch) => {
        const ok = await save("the closure period", () =>
          db().from("closure_periods").update(toRow(patch)).eq("id", id).select("id")
        );
        if (ok) setClosures((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
        return ok;
      },

      deleteClosure: async (id) => {
        const ok = await save("the change", () => db().from("closure_periods").delete().eq("id", id).select("id"));
        if (ok) setClosures((prev) => prev.filter((c) => c.id !== id));
        return ok;
      },

      wineCountUsingMedia: (mediaId) => wines.filter((w) => w.imageMediaId === mediaId).length,
    };
  }, [wines, media, retailers, closures, pageImages, pageText, siteSettings]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
