import type { Metadata } from "next";

import { ContentPage } from "@/components/public/content-page";

export const metadata: Metadata = { title: "Affiliate disclosure", alternates: { canonical: "/affiliate-disclosure" } };

export default function AffiliateDisclosurePage() {
  return (
    <ContentPage eyebrow="Transparency" title="Affiliate disclosure" introduction="As an Amazon Associate I earn from qualifying purchases.">
      <section><h2>How affiliate links work</h2><p>Some product links on Home Essentials lead to Amazon.com and include an Associates tracking ID. If you follow one of these links and make a qualifying purchase, Home Essentials may receive a commission. Your price is not increased because of that commission.</p></section>
      <section><h2>Editorial independence</h2><p>Affiliate eligibility does not replace editorial judgment. A product must meet the website&apos;s publication requirements before its recommendation and Amazon destination become public.</p></section>
      <section><h2>Prices and availability</h2><p>Amazon controls product pages, prices, availability, delivery, returns, and purchases. Unless a price is supplied through an approved and recently verified Amazon data source, Home Essentials does not display one.</p></section>
    </ContentPage>
  );
}
