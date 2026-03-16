import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import localFont from "next/font/local";

import { DevTools } from "@/components/dev-tools";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-ibm-plex-sans-condensed",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const uncutSans = localFont({
  src: "../../public/fonts/UncutSans-Regular.woff2",
  variable: "--font-uncut-sans",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Middle East Tracker",
  description:
    "Live news tracker for major English outlets covering Israel, Iran, and USA conflict updates.",
  themeColor: "#131314",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSansCondensed.variable} ${geist.variable} ${geistMono.variable} ${uncutSans.variable} antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <DevTools />
      </body>
    </html>
  );
}
