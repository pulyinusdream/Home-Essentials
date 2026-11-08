import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleRenderer, type ArticleProductCard, type RelatedArticleCard } from "@/components/articles/article-renderer";
import { ProductStatus } from "@/components/products/product-status";
import { getArticleEditorOptions, getArticleEditorRecord } from "@/services/articles/queries";

export const metadata: Metadata = { title: "Buying guide preview", robots: { index: false, follow: false } };

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, options] = await Promise.all([getArticleEditorRecord(id), getArticleEditorOptions(id)]);
  if (!record) notFound();
  const products = new Map<string, ArticleProductCard>(options.products.map((product) => [product.id, { id: product.id, name: product.name, slug: product.slug, shortDescription: product.short_description, imageUrl: product.main_image_url, imageAlt: product.main_image_alt }]));
  const articles = new Map<string, RelatedArticleCard>(options.articles.map((article) => [article.id, { id: article.id, title: article.title, slug: article.slug }]));

  return (
    <div className="admin-page article-preview-page">
      <header className="preview-toolbar"><Link href={`/admin/articles/${id}/edit`}><ArrowLeft aria-hidden="true" />Back to editor</Link><div><span>Private preview</span><ProductStatus status={record.article.status} /></div></header>
      <article className="article-preview">
        <header className="article-preview__header">
          <p className="eyebrow">Home Essentials guide</p>
          <h1>{record.article.title}</h1>
          <p>{record.article.excerpt || "Add a useful summary in the editor."}</p>
        </header>
        {record.article.featured_image_url ? <div className="article-preview__cover" role="img" aria-label={record.article.featured_image_alt || record.article.title} style={{ backgroundImage: `url(${JSON.stringify(record.article.featured_image_url)})` }} /> : null}
        <ArticleRenderer blocks={record.blocks} productsById={products} articlesById={articles} />
      </article>
    </div>
  );
}
