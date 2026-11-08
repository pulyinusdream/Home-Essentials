import type { Metadata } from "next";

import { ContentPage } from "@/components/public/content-page";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <ContentPage title="Useful ideas for a home that works better." introduction="Home Essentials is an independent editorial website for US shoppers looking for practical household products and clear buying guidance.">
      <section><h2>How recommendations are chosen</h2><p>Every published recommendation is written to solve a specific household need. Product facts and destinations are reviewed before publication, and guides explain context and tradeoffs instead of presenting thin lists.</p></section>
      <section><h2>What this website is not</h2><p>Home Essentials is not a retailer. We do not operate a checkout, hold inventory, process payments, ship products, or manage Amazon orders and returns.</p></section>
      <section><h2>How the website is supported</h2><p>Some links lead to Amazon.com through an affiliate URL. If you make a qualifying purchase after using one of those links, Home Essentials may earn a commission at no additional cost to you.</p></section>
    </ContentPage>
  );
}
