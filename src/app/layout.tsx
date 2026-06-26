import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { SettingsProvider } from "@/lib/settings-context";
import { Providers } from "@/lib/providers";
import { getSettings } from "@/lib/settings";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return {
    title: `${settings.siteName} - ${settings.siteTagline}`,
    description: settings.siteDescription,
    authors: [{ name: settings.siteName }],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: settings.logoUrl, sizes: "any" },
      ],
      apple: settings.logoUrl,
    },
    openGraph: {
      title: `${settings.siteName} - ${settings.siteTagline}`,
      description: settings.siteDescription,
      siteName: settings.siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.siteName} - ${settings.siteTagline}`,
      description: settings.siteDescription,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          <Providers>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </Providers>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
