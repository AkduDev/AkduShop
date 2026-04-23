import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolsos Lesly - Elegancia y Estilo",
  description: "Bolsos y carteras artesanales confeccionados con los mejores materiales. Cada pieza cuenta una historia de calidad y distinción.",
  keywords: ["bolsos", "carteras", "cuero", "moda", "elegancia", "artesanal", "Cuba", "La Habana"],
  authors: [{ name: "Bolsos Lesly" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo-profesional.jpg", sizes: "any" },
    ],
    apple: "/logo-profesional.jpg",
  },
  openGraph: {
    title: "Bolsos Lesly - Elegancia y Estilo",
    description: "Bolsos y carteras artesanales de alta calidad",
    url: "http://localhost:3000",
    siteName: "Bolsos Lesly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bolsos Lesly - Elegancia y Estilo",
    description: "Bolsos y carteras artesanales de alta calidad",
  },
};

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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
