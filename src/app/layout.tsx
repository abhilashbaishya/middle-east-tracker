import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Middle East Tracker",
  description:
    "Live news tracker for major English outlets covering Israel, Iran, and USA conflict updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSansCondensed.variable} ${geist.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
