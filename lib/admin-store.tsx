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
 *  - Supabase configured (production): wines, retailers, closures and
 *    media are written to Supabase first, and only shown once saved.
 *    Page Content (texts, pictures) and the design profile are shown
 *    straight away as a live preview and saved in the background (see
 *    "Autosave" below); if that save fails the preview is rolled back to
 *    the last saved value and the admin gets an error with "Try again".
 *    Pictures are
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
  /** Autosave state for Page Content and Design, shown in the admin. */
  saveStatus: SaveStatus;
  saveError: string | null;
  /**
   * Save anything still waiting for the typing pause right now, and wait
   * for every save in progress. Resolves true if all saved, false if any
   * failed (the error box is then showing).
   */
  flushSaves: () => Promise<boolean>;
  /** Re-apply and re-save the changes that failed (and were rolled back). */
  retrySave: () => void;
  /** Forget the failed changes (they are already rolled back). */
  dismissSaveError: () => void;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Changes whose save failed: rolled back on screen, kept here for "Try again". */
interface FailedChanges {
  text: Record<string, string>;
  images: Record<string, string>;
  settings: Partial<SiteSettings>;
}
const noFailures = (): FailedChanges => ({ text: {}, images: {}, settings: {} });
const hasFailures = (f: FailedChanges) =>
  Object.keys(f.text).length + Object.keys(f.images).length + Object.keys(f.settings).length > 0;

const AdminContext = createContext<AdminContextValue | null>(null);

// How long to wait after the last keystroke / color change before saving
// text fields and the design profile to Supabase (blur or leaving the
// page saves straight away).
const SAVE_DELAY_MS = 800;

type DbResult = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/**
 * Runs one Supabase write. Returns null on success, or the error message.
 * In local mode (no Supabase) this is a no-op that succeeds.
 *
 * Every write must end in `.select(...)` so it returns the rows it
 * touched: when row-level security blocks an update or delete (e.g. the
 * session expired, or the user isn't in `admins`), Supabase reports no
 * error, just 0 rows — so 0 rows is treated as a failure too.
 */
async function trySave(write: () => DbResult): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await write();
    if (error) return error.message;
    if (!data || data.length === 0) return "not allowed or not found — try signing out and in again.";
    return null;
  } catch (err) {
    // Network down, request aborted, ...
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * Like trySave, but tells the admin with an alert on failure and returns
 * false, so the caller leaves the screen unchanged. Used for the forms
 * that only update the screen after saving (wines, retailers, ...).
 */
async function save(what: string, write: () => DbResult): Promise<boolean> {
  const message = await trySave(write);
  if (message) {
    window.alert(`Could not save ${what}: ${message}`);
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

  // ── Autosave for Page Content (texts, pictures) and Design ─────────
  // Edits show immediately (live preview). Texts and design fields are
  // saved after a short typing pause, or straight away on blur / leaving
  // the page; pictures are saved straight away. `saved` holds the last
  // value the database confirmed, so a failed save can roll back to it.
  // `versions` counts edits per field: a failed save only rolls back if
  // nothing newer was typed in the meantime (that newer edit has its own
  // save on the way).
  const saved = useRef({
    text: { ...initialData.pageText },
    images: { ...initialData.pageImages },
    settings: initialData.siteSettings,
  });
  const versions = useRef<Record<string, number>>({});
  const queuedText = useRef<Record<string, string>>({});
  const textTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const queuedSettings = useRef<Partial<SiteSettings>>({});
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(0);
  const chains = useRef<Record<string, Promise<unknown>>>({});
  const failed = useRef<FailedChanges>(noFailures());
  const running = useRef(new Set<Promise<void>>());

  const [busy, setBusy] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const autosave = useMemo(() => {
    const version = (k: string) => versions.current[k] ?? 0;
    const bump = (k: string) => {
      versions.current[k] = version(k) + 1;
    };

    const hasQueued = () =>
      Object.keys(queuedText.current).length > 0 || settingsTimer.current !== null;
    const refresh = () => setBusy(inFlight.current > 0 || hasQueued());
    const clearErrorIfResolved = () => {
      if (!hasFailures(failed.current)) setSaveError(null);
    };

    // Saves on the same channel run one after another, so an older value
    // can never land in the database after a newer one.
    function enqueue(channel: string, write: () => DbResult): Promise<string | null> {
      inFlight.current++;
      refresh();
      const run = (chains.current[channel] ?? Promise.resolve()).then(() => trySave(write));
      chains.current[channel] = run;
      return run.finally(() => {
        inFlight.current--;
        refresh();
      });
    }

    // Keeps every save (including its rollback handling) until it's done,
    // so flush() can wait for all of them.
    function track(p: Promise<void>) {
      running.current.add(p);
      void p.finally(() => running.current.delete(p));
    }

    function succeeded() {
      setSavedOnce(true);
      clearErrorIfResolved();
    }

    // Puts a map key back to its last saved value (or removes it, so the
    // default shows again — that's what was on screen before the edit).
    function revertKey(prev: Record<string, string>, key: string, savedValue: string | undefined) {
      const next = { ...prev };
      if (savedValue === undefined) delete next[key];
      else next[key] = savedValue;
      return next;
    }

    async function saveText(key: string, value: string) {
      const v = version(`text:${key}`);
      const error = await enqueue(`text:${key}`, () =>
        db().from("page_content").upsert({ key, kind: "text", value }).select("key")
      );
      if (!error) {
        saved.current.text[key] = value;
        delete failed.current.text[key];
        return succeeded();
      }
      if (version(`text:${key}`) === v) {
        setPageTextState((prev) => revertKey(prev, key, saved.current.text[key]));
        failed.current.text[key] = value;
      }
      setSaveError(error);
    }

    async function saveImage(key: string, mediaId: string) {
      const v = version(`image:${key}`);
      const error = await enqueue(`image:${key}`, () =>
        db().from("page_content").upsert({ key, kind: "image", value: mediaId }).select("key")
      );
      if (!error) {
        saved.current.images[key] = mediaId;
        delete failed.current.images[key];
        return succeeded();
      }
      if (version(`image:${key}`) === v) {
        setPageImages((prev) => revertKey(prev, key, saved.current.images[key]));
        failed.current.images[key] = mediaId;
      }
      setSaveError(error);
    }

    async function saveSettings(patch: Partial<SiteSettings>) {
      const fields = Object.keys(patch) as (keyof SiteSettings)[];
      const v = Object.fromEntries(fields.map((f) => [f, version(`settings:${f}`)]));
      const error = await enqueue("settings", () =>
        db().from("site_settings").update(toRow(patch)).eq("id", 1).select("id")
      );
      if (!error) {
        saved.current.settings = { ...saved.current.settings, ...patch };
        fields.forEach((f) => delete failed.current.settings[f]);
        return succeeded();
      }
      const stale = fields.filter((f) => version(`settings:${f}`) === v[f]);
      if (stale.length > 0) {
        const revert = Object.fromEntries(stale.map((f) => [f, saved.current.settings[f]]));
        const failedPart = Object.fromEntries(stale.map((f) => [f, patch[f]]));
        setSiteSettings((prev) => ({ ...prev, ...revert }));
        failed.current.settings = { ...failed.current.settings, ...failedPart };
      }
      setSaveError(error);
    }

    function flushText(key: string) {
      if (!(key in queuedText.current)) return;
      const value = queuedText.current[key];
      delete queuedText.current[key];
      clearTimeout(textTimers.current[key]);
      delete textTimers.current[key];
      track(saveText(key, value));
    }

    function flushSettings() {
      if (settingsTimer.current) clearTimeout(settingsTimer.current);
      settingsTimer.current = null;
      const patch = queuedSettings.current;
      queuedSettings.current = {};
      if (Object.keys(patch).length > 0) track(saveSettings(patch));
      else refresh();
    }

    function editText(key: string, value: string, immediate = false) {
      setPageTextState((prev) => ({ ...prev, [key]: value }));
      bump(`text:${key}`);
      delete failed.current.text[key]; // a new edit replaces the failed one
      clearErrorIfResolved();
      queuedText.current[key] = value;
      clearTimeout(textTimers.current[key]);
      if (immediate) return flushText(key);
      textTimers.current[key] = setTimeout(() => flushText(key), SAVE_DELAY_MS);
      refresh();
    }

    function editImage(key: string, mediaId: string) {
      setPageImages((prev) => ({ ...prev, [key]: mediaId }));
      bump(`image:${key}`);
      delete failed.current.images[key];
      clearErrorIfResolved();
      track(saveImage(key, mediaId));
    }

    function editSettings(patch: Partial<SiteSettings>, immediate = false) {
      setSiteSettings((prev) => ({ ...prev, ...patch }));
      for (const f of Object.keys(patch) as (keyof SiteSettings)[]) {
        bump(`settings:${f}`);
        delete failed.current.settings[f];
      }
      clearErrorIfResolved();
      queuedSettings.current = { ...queuedSettings.current, ...patch };
      if (settingsTimer.current) clearTimeout(settingsTimer.current);
      if (immediate) return flushSettings();
      settingsTimer.current = setTimeout(flushSettings, SAVE_DELAY_MS);
      refresh();
    }

    /** Sends everything queued, waits for all saves; true if nothing failed. */
    async function flush(): Promise<boolean> {
      Object.keys(queuedText.current).forEach(flushText);
      if (settingsTimer.current) flushSettings();
      while (running.current.size > 0) {
        await Promise.all([...running.current]);
      }
      return !hasFailures(failed.current);
    }

    function retry() {
      const f = failed.current;
      failed.current = noFailures();
      setSaveError(null);
      Object.entries(f.text).forEach(([k, v]) => editText(k, v, true));
      Object.entries(f.images).forEach(([k, v]) => editImage(k, v));
      if (Object.keys(f.settings).length > 0) editSettings(f.settings, true);
    }

    function dismiss() {
      failed.current = noFailures();
      setSaveError(null);
    }

    const hasUnsaved = () => inFlight.current > 0 || hasQueued() || hasFailures(failed.current);

    return { editText, editImage, editSettings, flush, retry, dismiss, hasUnsaved };
  }, []);

  // Save straight away when the admin leaves or hides the tab, and warn
  // before closing/reloading while something isn't saved yet.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const unsaved = autosave.hasUnsaved();
      void autosave.flush();
      if (unsaved) {
        e.preventDefault();
        e.returnValue = ""; // older browsers need this to show the warning
      }
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") void autosave.flush();
    };
    const onPageHide = () => void autosave.flush();
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [autosave]);

  const saveStatus: SaveStatus = saveError ? "error" : busy ? "saving" : savedOnce ? "saved" : "idle";

  const value = useMemo<AdminContextValue>(() => {
    return {
      wines,
      media,
      retailers,
      closures,
      pageImages,
      pageText,
      siteSettings,
      saveStatus,
      saveError,
      flushSaves: autosave.flush,
      retrySave: autosave.retry,
      dismissSaveError: autosave.dismiss,

      setPageImage: (sectionKey, mediaId) => autosave.editImage(sectionKey, mediaId),

      setPageText: (textKey, val) => autosave.editText(textKey, val),

      updateSiteSettings: (patch) => autosave.editSettings(patch),

      setLogo: async (file) => {
        const { url } = await uploadOrAlert(file, 800, 0.92);
        autosave.editSettings({ logoUrl: url }, true);
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
  }, [
    wines,
    media,
    retailers,
    closures,
    pageImages,
    pageText,
    siteSettings,
    saveStatus,
    saveError,
    autosave,
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
