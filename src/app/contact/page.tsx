import type { Metadata } from "next";

import { ContentPage } from "@/components/public/content-page";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  const email = validEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
  return (
    <ContentPage title="Questions, corrections, or a product concern?" introduction="We welcome factual corrections and feedback about published recommendations.">
      <section>
        <h2>Get in touch</h2>
        {email ? <p>Email <a href={`mailto:${email}`}>{email}</a>. Please include the page address when reporting a correction or broken link.</p> : <p>The public contact address has not been configured yet. Add <code>NEXT_PUBLIC_CONTACT_EMAIL</code> in Vercel before launch.</p>}
      </section>
      <section><h2>Amazon orders</h2><p>Home Essentials cannot access, change, cancel, refund, or track Amazon orders. Contact Amazon customer service for order and account support.</p></section>
    </ContentPage>
  );
}

function validEmail(value: string | undefined) {
  const email = value?.trim();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
