import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AdminStoreProvider } from "@/lib/admin-store";
import { getSiteData } from "@/lib/data";
import SiteTheme from "@/components/SiteTheme";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { siteSettings } = await getSiteData();
  return {
    title: `${siteSettings.name} — ${siteSettings.legalName}`,
    description: `${siteSettings.legalName} — ${siteSettings.tagline}`,
  };
}

// Pages are rendered per request (getLocale reads the request), so admin
// changes saved to Supabase show up on the public site immediately.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const initialData = await getSiteData();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        <AdminStoreProvider initialData={initialData}>
          <SiteTheme />
          {children}
        </AdminStoreProvider>
      </body>
    </html>
  );
}
