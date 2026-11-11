"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not-admin"
      ? "This account doesn't have admin access."
      : null
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    });
    if (error) {
      setBusy(false);
      setError("Wrong email or password.");
      return;
    }
    const { data: isAdmin } = await supabase.rpc("is_admin");
    setBusy(false);
    if (isAdmin !== true) {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
      return;
    }
    // Only allow redirects back into the admin panel.
    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  if (!isSupabaseConfigured) {
    return (
      <p className="text-sm text-ink/70">
        Sign-in isn&rsquo;t available: Supabase is not configured on this
        server (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink/70">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border border-black/15 px-3 py-2 bg-white focus:outline-none focus:border-black"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink/70">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-black/15 px-3 py-2 bg-white focus:outline-none focus:border-black"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="bg-black text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f2ee] text-ink px-4">
      <div className="w-full max-w-sm bg-white border border-black/10 p-8">
        <h1 className="font-serif text-2xl text-black mb-6">Admin sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
