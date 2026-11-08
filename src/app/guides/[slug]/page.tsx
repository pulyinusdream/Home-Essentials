import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Share2 } from "lucide-react";

import { ArticleRenderer } from "@/components/articles/article-renderer";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { PublicShell } from "@/components/public/public-shell";
import { buildEditorialMetadata } from "@/lib/seo/metadata";
import { fetchPublicArticle } from "@/services/public/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublicArticle(slug);
  if (!result) return { title: "Guide not found" };
  const { article } = result;
  return buildEditorialMetadata({
    title: article.title,
    seoTitle: article.seo_title,
    description: article.seo_description || article.excerpt || `Read ${article.title}.`,
    canonicalPath: `/guides/${article.slug}`,
    imageUrl: article.featured_image_url,
    imageAlt: article.featured_image_alt,
    type: "article",
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await fetchPublicArticle(slug);
  if (!result) notFound();
  const { article, category, blocks, productsById, articlesById } = result;
  const canonical = absoluteUrl(`/guides/${article.slug}`);
  const share = new URL("https://www.pinterest.com/pin/create/button/");
  share.searchParams.set("url", canonical);
  share.searchParams.set("description", article.social_description || article.excerpt || article.title);
  if (article.featured_image_url) share.searchParams.set("media", article.featured_image_url);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Home Essentials" },
    ...(article.featured_image_url ? { image: [article.featured_image_url] } : {}),
  };

  return (
    <PublicShell>
      <script type="application/ld+json">{JSON.stringify(articleJsonLd).replace(/</g, "\\u003c")}</script>
      <div className="page-width public-breadcrumb-wrap">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []), { label: article.title }]} />
      </div>
      <article className="public-guide">
        <header className="public-guide__header page-width">
          <p className="eyebrow">{category?.name || "Home Essentials guide"}</p>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div>
            {article.published_at ? <time dateTime={article.published_at}>{new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(article.published_at))}</time> : null}
            <a href={share.toString()} target="_blank" rel="noopener noreferrer"><Share2 aria-hidden="true" /> Save to Pinterest</a>
          </div>
        </header>
        {article.featured_image_url ? (
          <div className="public-guide__cover" role="img" aria-label={article.featured_image_alt || article.title} style={{ backgroundImage: `url(${JSON.stringify(article.featured_image_url)})` }} />
        ) : null}
        <p className="public-guide__disclosure">This guide may contain Amazon affiliate recommendations. As an Amazon Associate I earn from qualifying purchases.</p>
        <ArticleRenderer blocks={blocks} productsById={productsById} articlesById={articlesById} />
      </article>
    </PublicShell>
  );
}

function absoluteUrl(path: string) {
  try { return new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").toString(); }
  catch { return `http://127.0.0.1:3000${path}`; }
}
