import AdminShell from "@/components/admin/AdminShell";

/**
 * PROTOTYPE NOTE: this layout skips real authentication. In production,
 * wrap this in a Supabase Auth check (redirect to /admin/login if no
 * session) instead of always rendering AdminShell. The in-memory data
 * store (see /lib/admin-store.tsx) is now provided at the root layout
 * so both /admin and the public site share the same picture choices.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
