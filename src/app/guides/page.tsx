import type { Metadata } from "next";

import { ArticleCard } from "@/components/public/article-card";
import { PublicShell } from "@/components/public/public-shell";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fetchPublicArticles,
  publicContentIsConfigured,
} from "@/services/public/repository";

export const metadata: Metadata = {
  title: "Buying guides",
  description: "Useful room-by-room ideas and practical home buying guides.",
  alternates: { canonical: "/guides" },
};
export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const articles = await fetchPublicArticles();
  const configured = publicContentIsConfigured();
  return (
    <PublicShell>
      <header className="public-page-hero page-width">
        <p className="eyebrow">Ideas worth saving</p>
        <h1>Practical guidance before the product link.</h1>
        <p>
          Start with a household question, understand the tradeoffs, and then
          explore recommendations that fit the need.
        </p>
      </header>
      <section className="public-listing page-width" aria-label="Buying guides">
        {articles.length > 0 ? (
          <div className="public-article-grid public-article-grid--catalog">
            {articles.map((article) => <ArticleCard article={article} key={article.id} />)}
          </div>
        ) : (
          <EmptyState
            title={configured ? "The first guide is being prepared" : "Connect Supabase to publish guides"}
            description={configured ? "Published buying guides will appear here." : "Create useful guides from the private admin after your hosted Supabase project is connected."}
          />
        )}
      </section>
    </PublicShell>
  );
}
