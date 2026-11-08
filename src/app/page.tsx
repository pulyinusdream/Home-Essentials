import Link from "next/link";

import { ArticleCard } from "@/components/public/article-card";
import {
  CategoryCard,
  defaultPublicCategories,
} from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { PublicShell } from "@/components/public/public-shell";
import { HeroRoomGallery } from "@/components/public/hero-room-gallery";
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
          <h1>
            <span>Better finds for</span>
            <span>everyday homes</span>
          </h1>
          <p>
            Reviewed home essentials and useful buying guides for US shoppers.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/products">
              Browse products
            </Link>
            <Link className="text-link" href="/categories">
              Shop by room
            </Link>
          </div>
        </div>
        <HeroRoomGallery />
      </section>

      <section className="category-section" aria-labelledby="category-heading">
        <div className="page-width">
          <div className="section-heading">
            <h2 id="category-heading">Start with a room</h2>
            <Link className="text-link" href="/categories">
              See all categories
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard category={category} key={category.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="finds-section" aria-labelledby="finds-heading">
        <div className="page-width">
          <div className="section-heading section-heading--editorial">
            <h2 id="finds-heading">Reviewed home essentials</h2>
            <p>
              Each recommendation is published only after its product details
              and Amazon destination have been checked.
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
        </div>
      </section>

      {articles.length > 0 ? (
        <section className="guides-section" aria-labelledby="guides-heading">
          <div className="page-width">
            <div className="section-heading">
              <h2 id="guides-heading">Useful buying guides</h2>
              <Link className="text-link" href="/guides">Browse all guides</Link>
            </div>
            <div className="public-article-grid">
              {articles.map((article) => <ArticleCard article={article} key={article.id} />)}
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}
