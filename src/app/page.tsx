import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/public/article-card";
import {
  CategoryCard,
  defaultPublicCategories,
} from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { PublicShell } from "@/components/public/public-shell";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fetchPublicArticles,
  fetchPublicCategories,
  fetchPublicProducts,
  publicContentIsConfigured,
} from "@/services/public/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured = publicContentIsConfigured();
  const [storedCategories, products, articles] = await Promise.all([
    fetchPublicCategories(4),
    fetchPublicProducts({ limit: 6 }),
    fetchPublicArticles({ limit: 3 }),
  ]);
  const categories = configured ? storedCategories : defaultPublicCategories();

  return (
    <PublicShell>
      <section className="hero page-width">
        <div className="hero__copy">
          <h1>Make Your Home Feel More Like Home.</h1>
          <p>
            Discover thoughtful home finds, practical essentials, and simple
            ideas for everyday living.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/products">
              Explore Home Finds
            </Link>
            <Link className="text-link" href="/categories">
              Browse Categories
            </Link>
          </div>
        </div>
        <div className="hero__media">
          <Image
            src="/assets/kitchen.png"
            alt="Warm kitchen interior with uncluttered counters"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <p className="hero__caption">
            Ideas for rooms that work beautifully every day.
          </p>
        </div>
      </section>

      <section className="category-section page-width" aria-labelledby="category-heading">
        <div className="section-heading">
          <h2 id="category-heading">Shop by category</h2>
          <Link className="text-link" href="/categories">
            See all categories
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section className="finds-section page-width" aria-labelledby="finds-heading">
        <div className="section-heading section-heading--stacked">
          <p className="eyebrow">Reviewed recommendations</p>
          <h2 id="finds-heading">Useful finds, carefully considered</h2>
          <p>
            We publish a product only after its details and Amazon destination
            have been reviewed.
          </p>
        </div>
        {products.length > 0 ? (
          <div className="public-product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={configured ? "Recommendations are being prepared" : "Connect Supabase to publish products"}
            description={
              configured
                ? "The first reviewed home essentials will appear here after publication."
                : "Add your hosted Supabase project details, then create and publish products from the private admin."
            }
          />
        )}
      </section>

      {articles.length > 0 ? (
        <section className="guides-section page-width" aria-labelledby="guides-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Room-by-room guidance</p>
              <h2 id="guides-heading">Ideas worth saving</h2>
            </div>
            <Link className="text-link" href="/guides">Browse all guides</Link>
          </div>
          <div className="public-article-grid">
            {articles.map((article) => <ArticleCard article={article} key={article.id} />)}
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}
