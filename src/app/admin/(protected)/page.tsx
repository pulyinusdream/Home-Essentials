import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, PackagePlus, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default function AdminOverviewPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Your publishing workspace</h1>
          <p>
            Add verified products, build useful buying guides, and publish only
            when every compliance check is ready.
          </p>
        </div>
      </header>

      <section className="admin-priority-grid" aria-label="Primary workflows">
        <Link href="/admin/products/new" className="admin-priority-card">
          <PackagePlus aria-hidden="true" />
          <div>
            <span>Product workflow</span>
            <h2>Add a home essential</h2>
            <p>Build the recommendation, images, verified link, and SEO in one editor.</p>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/admin/articles/new" className="admin-priority-card">
          <BookOpenText aria-hidden="true" />
          <div>
            <span>Content workflow</span>
            <h2>Create a buying guide</h2>
            <p>Give Pinterest visitors useful context before recommending products.</p>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="admin-compliance-note">
        <ShieldCheck aria-hidden="true" />
        <div>
          <p className="eyebrow">Built-in publishing guard</p>
          <h2>No unverified product goes public.</h2>
          <p>
            Publication requires complete editorial content, an active category,
            accessible imagery, and a verified Amazon.com affiliate destination.
            Prices stay hidden unless supplied by an approved Amazon API workflow.
          </p>
        </div>
      </section>
    </div>
  );
}
