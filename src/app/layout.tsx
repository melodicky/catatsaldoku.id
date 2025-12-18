import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { VisualEditsMessenger } from "orchids-visual-edits";

import "./globals.css";

import ErrorReporter from "@/components/ErrorReporter";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
      default: "CatatSaldoku - Aplikasi Keuangan Pribadi Terbaik Indonesia 2025",
      template: "%s | CatatSaldoku"
    },
    description: "Aplikasi pelacak keuangan pribadi #1 di Indonesia. Kelola pemasukan, pengeluaran, target tabungan dengan dashboard visual, analisis cerdas, export data Excel/PDF. Gratis, aman & mudah digunakan.",
  keywords: [
    "aplikasi keuangan pribadi",
    "pelacak keuangan",
    "pencatat pengeluaran",
    "manajemen keuangan",
    "budget planner Indonesia",
    "aplikasi tabungan",
    "financial tracker",
    "expense tracker Indonesia",
    "money management app",
    "aplikasi mengatur keuangan",
    "catat pemasukan pengeluaran",
    "budget tracker gratis",
    "personal finance Indonesia",
    "aplikasi budgeting",
    "financial planning app"
  ],
      authors: [{ name: "CatatSaldoku Team" }],
      creator: "CatatSaldoku",
      publisher: "CatatSaldoku",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://catatsaldoku.com"),
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
      "en-US": "/en"
    }
  },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "/",
      siteName: "CatatSaldoku",
      title: "CatatSaldoku - Aplikasi Keuangan Pribadi Terbaik Indonesia",
      description: "Aplikasi pelacak keuangan pribadi #1 di Indonesia. Kelola pemasukan, pengeluaran, target tabungan dengan dashboard visual. Gratis, aman & mudah digunakan.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
          alt: "CatatSaldoku - Aplikasi Keuangan Pribadi",
        type: "image/svg+xml"
      }
    ]
  },
    twitter: {
      card: "summary_large_image",
      title: "CatatSaldoku - Aplikasi Keuangan Pribadi Terbaik",
      description: "Kelola keuangan dengan mudah, aman & cerdas. Dashboard visual, analisis real-time, export data. Gratis selamanya!",
      images: ["/og-image.svg"],
      creator: "@catatsaldoku"
    },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "verification_token_here",
    yandex: "verification_token_here",
    other: {
      "msvalidate.01": "verification_token_here"
    }
  },
  category: "finance",
  classification: "Personal Finance Application",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="37af5ce2-aa3a-42a6-9cad-b7389d39e2d1"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <Providers>
          {children}
        </Providers>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
