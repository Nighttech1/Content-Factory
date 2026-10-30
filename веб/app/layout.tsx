import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Armenian } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const notoArmenian = Noto_Sans_Armenian({
  variable: "--font-hy",
  subsets: ["armenian"],
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
