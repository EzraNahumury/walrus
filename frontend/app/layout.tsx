import type { Metadata } from "next";

import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "SignalVault — Encrypted feedback OS on Walrus",
  description:
    "Private feedback, public proof. SignalVault is a content-addressed, Seal-encrypted feedback platform built natively on Walrus.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://signalvault.ezidentity.wal.app",
  ),
  openGraph: {
    title: "SignalVault — Encrypted feedback OS on Walrus",
    description:
      "Private feedback, public proof. Forms, responses, and receipts on Walrus.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-[color:var(--color-ink-900)]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink-900)]">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
