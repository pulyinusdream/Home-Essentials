import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import "./public.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"),
  title: {
    default: "Home Essentials",
    template: "%s | Home Essentials",
  },
  description:
    "Thoughtful home finds, practical essentials, and useful buying guides for everyday living.",
  applicationName: "Home Essentials",
  openGraph: {
    type: "website",
    siteName: "Home Essentials",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
