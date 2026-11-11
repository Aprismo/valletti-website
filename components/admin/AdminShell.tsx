"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { SaveStatus, useAdminStore } from "@/lib/admin-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/design", label: "Design & Branding" },
  { href: "/admin/wines", label: "Wines" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/pages", label: "Page Content" },
  { href: "/admin/retailers", label: "Retailers" },
  { href: "/admin/closures", label: "Closure Periods" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { siteSettings, saveStatus, saveError, flushSaves, retrySave, dismissSaveError } =
    useAdminStore();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, [pathname]);

  // Moving to another admin page saves anything still waiting.
  useEffect(() => {
    void flushSaves();
  }, [pathname, flushSaves]);

  // Wait for every save first. If one fails, stay signed in: the error
  // box is showing, and signing out would lose the change.
  async function signOut() {
    setSigningOut(true);
    const allSaved = await flushSaves();
    if (!allSaved) {
      setSigningOut(false);
      return;
    }
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  // The login page is shown on its own, without the admin menu.
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-[#f4f2ee] text-ink">
      <aside className="w-60 shrink-0 bg-neutral-900 text-white flex flex-col">
        <div className="px-6 py-5 font-serif text-2xl border-b border-white/10">
          {siteSettings.name}
          <div className="text-xs uppercase tracking-wide text-white/50 font-sans mt-1">
            Admin
          </div>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {links.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-6 py-2.5 text-sm ${
                  active
                    ? "bg-white/10 text-white border-l-2 border-white"
                    : "text-white/70 hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs flex flex-col gap-2">
          <a
            href="/guida-admin.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white"
          >
            📖 Guida al pannello (IT) ↗
          </a>
          <Link href="/" className="text-white/60 hover:text-white">
            ← View public site
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/10 flex items-center justify-between px-8">
          {isSupabaseConfigured ? (
            <>
              <div className="text-sm text-ink/60">
                Signed in as <span className="font-medium text-ink">{email ?? "…"}</span>
              </div>
              <button
                onClick={signOut}
                disabled={signingOut}
                className="text-sm text-black hover:underline disabled:opacity-50"
              >
                {signingOut ? "Saving…" : "Sign out"}
              </button>
            </>
          ) : (
            <div className="text-sm text-ink/60">
              Local mode — Supabase not configured, changes stay in this browser.
            </div>
          )}
        </header>
        <main className="flex-1 p-8 max-w-5xl">{children}</main>
      </div>
      <SaveStatusBadge
        status={saveStatus}
        error={saveError}
        onRetry={retrySave}
        onDismiss={dismissSaveError}
      />
    </div>
  );
}

/** Fixed in the corner so it's visible however far the page is scrolled. */
function SaveStatusBadge({
  status,
  error,
  onRetry,
  onDismiss,
}: {
  status: SaveStatus;
  error: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <div
        role="alert"
        className="fixed bottom-6 right-6 z-50 max-w-sm bg-red-700 text-white shadow-lg px-4 py-3 text-sm"
      >
        <p className="font-medium">Couldn&rsquo;t save your change</p>
        <p className="text-white/80 text-xs mt-1">
          {error} The change has been undone, so the site still shows the last saved version.
        </p>
        <div className="flex gap-3 mt-3">
          <button
            onClick={onRetry}
            className="bg-white text-red-700 px-3 py-1 text-xs font-medium hover:bg-white/90"
          >
            Try again
          </button>
          <button onClick={onDismiss} className="text-xs text-white/80 hover:text-white underline">
            Discard change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 px-3 py-1.5 text-xs shadow border ${
        status === "saving"
          ? "bg-amber-50 border-amber-300 text-amber-900"
          : "bg-white border-black/10 text-ink/70"
      }`}
    >
      {status === "saving" ? "Saving…" : "✓ All changes saved"}
    </div>
  );
}
