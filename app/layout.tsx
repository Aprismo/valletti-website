import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AdminStoreProvider } from "@/lib/admin-store";
import { DEFAULT_SITE_SETTINGS } from "@/data/site-settings";
import SiteTheme from "@/components/SiteTheme";
import "./globals.css";

// Metadata is static (Next can't read the client-only design profile
// here), so it's sourced from the seed defaults in data/site-settings.ts
// — update that file's `name` when launching this template for a new
// winery. Once site_settings moves to Supabase (see schema.sql), this
// can become a real generateMetadata() reading the live row instead.
export const metadata: Metadata = {
  title: `${DEFAULT_SITE_SETTINGS.name} — ${DEFAULT_SITE_SETTINGS.legalName}`,
  description: `${DEFAULT_SITE_SETTINGS.legalName} — ${DEFAULT_SITE_SETTINGS.tagline}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        <AdminStoreProvider>
          <SiteTheme />
          {children}
        </AdminStoreProvider>
      </body>
    </html>
  );
}
