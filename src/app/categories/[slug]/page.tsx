import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/public/article-card";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { defaultPublicCategories } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { PublicShell } from "@/components/public/public-shell";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fetchPublicArticles,
  fetchPublicCategory,
  fetchPublicProducts,
  publicContentIsConfigured,
} from "@/services/public/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description || `Explore ${category.name.toLowerCase()} recommendations and guides.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) notFound();
  const [products, articles] = await Promise.all([
    fetchPublicProducts({ category: slug }),
    fetchPublicArticles({ category: slug, limit: 6 }),
  ]);

  return (
    <PublicShell>
      <div className="page-width public-breadcrumb-wrap">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} />
      </div>
      <header className="public-page-hero public-page-hero--compact page-width">
        <h1>{category.name}</h1>
        <p>{category.description || "Practical recommendations for everyday living."}</p>
      </header>
      <section className="public-listing page-width" aria-labelledby="category-products">
        <div className="section-heading"><h2 id="category-products">Recommended finds</h2></div>
        {products.length > 0 ? (
          <div className="public-product-grid">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
        ) : (
          <EmptyState title="No published recommendations yet" description="Reviewed products for this category will appear here after publication." />
        )}
      </section>
      {articles.length > 0 ? (
        <section className="guides-section page-width" aria-labelledby="category-guides">
          <div className="section-heading"><h2 id="category-guides">Useful guides</h2></div>
          <div className="public-article-grid">{articles.map((article) => <ArticleCard article={article} key={article.id} />)}</div>
        </section>
      ) : null}
    </PublicShell>
  );
}

async function resolveCategory(slug: string) {
  if (!publicContentIsConfigured()) {
    return defaultPublicCategories().find((category) => category.slug === slug) ?? null;
  }
  return fetchPublicCategory(slug);
}
