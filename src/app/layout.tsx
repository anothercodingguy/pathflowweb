import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "https://thepathflow.online";

export const viewport: Viewport = {
  themeColor: "#FAFAF9",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "PathFlow — Production Observability & Debugging",
  description: "PathFlow helps developers investigate production failures, trace execution paths, find root causes with evidence, and get to fixes faster.",
  alternates: {
    canonical: "https://thepathflow.online",
  },
  openGraph: {
    title: "PathFlow — Production Observability & Debugging",
    description: "Investigate production errors, trace execution paths, isolate root causes with evidence, and get to fixes faster.",
    url: "https://thepathflow.online",
    siteName: "PathFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathFlow — Production Observability & Debugging",
    description: "Investigate production errors and trace execution paths. Trace execution paths and find root causes faster.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-black/10">
        {children}
      </body>
    </html>
  );
}
