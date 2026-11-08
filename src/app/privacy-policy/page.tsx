import type { Metadata } from "next";

import { ContentPage } from "@/components/public/content-page";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy-policy" } };

export default function PrivacyPolicyPage() {
  return (
    <ContentPage meta="Last updated November 8, 2026" title="Privacy policy" introduction="This policy explains the limited information used to operate Home Essentials.">
      <section><h2>Public browsing</h2><p>Home Essentials does not provide public accounts, accept public form submissions, or run first-party affiliate click analytics at launch. Vercel and other infrastructure providers may process ordinary request information such as an IP address, browser details, requested page, and time of access under their own policies.</p></section>
      <section><h2>Authentication and administration</h2><p>Authorized staff sign-in is provided through Supabase. Essential authentication cookies are used only to maintain protected administration sessions. Public account registration is not offered.</p></section>
      <section><h2>Amazon links</h2><p>When you follow a recommendation link, your browser opens Amazon.com directly. Amazon receives information according to its own privacy policy and may recognize the Associates tracking ID in that link. Home Essentials does not receive your Amazon credentials or complete purchase records.</p></section>
      <section><h2>How information is used</h2><p>Administrative account information and ordinary service logs are used to secure and operate the website, publish content, and diagnose technical errors.</p></section>
      <section><h2>Contact</h2><p>Use the contact page to ask a privacy question or report a concern. This policy should be reviewed whenever analytics, forms, or additional service providers are added.</p></section>
    </ContentPage>
  );
}
