import type { Metadata } from "next";

import { ContentPage } from "@/components/public/content-page";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms-of-use" } };

export default function TermsPage() {
  return (
    <ContentPage meta="Last updated November 8, 2026" title="Terms of use" introduction="By using Home Essentials, you agree to use the website lawfully and understand the limits of its editorial recommendations.">
      <section><h2>Editorial information</h2><p>Content is provided for general informational purposes. Household needs differ, and you are responsible for checking dimensions, materials, compatibility, safety instructions, and the current merchant listing before purchasing or using a product.</p></section>
      <section><h2>Third-party merchants</h2><p>Amazon and other external websites control their own pages and transactions. Home Essentials is not responsible for their prices, availability, shipping, warranties, returns, policies, or account services.</p></section>
      <section><h2>Acceptable use</h2><p>Do not attempt to disrupt the website, bypass protected administration, submit malicious requests, or reuse the website&apos;s original editorial content in a misleading way.</p></section>
      <section><h2>Changes</h2><p>Content and these terms may be updated as the website evolves. The date above identifies the current version.</p></section>
    </ContentPage>
  );
}
