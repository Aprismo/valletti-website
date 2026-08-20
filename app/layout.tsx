import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AdminStoreProvider } from "@/lib/admin-store";
import "./globals.css";

// Note: using system font stacks (defined in globals.css) instead of
// next/font/google so the site builds without a live connection to
// Google Fonts. Swap in next/font/google for "Cormorant Garamond" /
// "Inter" (or any brand fonts Roberto prefers) once deploying for real.

export const metadata: Metadata = {
  title: "Valletti — Azienda Agricola",
  description:
    "Valletti is a small family winery in Piemonte, Italy, making wine by hand under the guidance of Roberto Valletti.",
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
        <AdminStoreProvider>{children}</AdminStoreProvider>
      </body>
    </html>
  );
}
