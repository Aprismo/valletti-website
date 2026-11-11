import AdminShell from "@/components/admin/AdminShell";

/**
 * Access to /admin is enforced in proxy.ts (Supabase Auth: not signed in
 * -> /admin/login). Writes are additionally protected by row-level
 * security in Supabase, so only a signed-in admin can change content.
 * The data store (lib/admin-store.tsx) is provided at the root layout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
