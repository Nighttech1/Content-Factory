import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const jetbrainsMono = localFont({
  src: "../public/fonts/jetbrains-mono-variable.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-mono-jb",
  display: "swap",
});

const notoArmenian = localFont({
  src: "../public/fonts/noto-sans-armenian.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-hy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vernatun Content Factory",
  description: "Modular AI content studio — Deep Matte Dark Luxury",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${notoArmenian.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
