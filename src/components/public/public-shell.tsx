import type { ReactNode } from "react";
import { Hanken_Grotesk } from "next/font/google";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

const publicFont = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-public",
  display: "swap",
});

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className={`public-site ${publicFont.variable}`}>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
