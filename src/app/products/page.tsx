import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { defaultPublicCategories } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { PublicShell } from "@/components/public/public-shell";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fetchPublicCategories,
  fetchPublicProducts,
  publicContentIsConfigured,
} from "@/services/public/repository";

export const metadata: Metadata = {
  title: "Home finds",
  description: "Browse carefully reviewed home essentials and practical product recommendations.",
  alternates: { canonical: "/products" },
};
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const search = single(values.q).slice(0, 120);
  const category = single(values.category).slice(0, 100);
  const configured = publicContentIsConfigured();
  const [products, storedCategories] = await Promise.all([
    fetchPublicProducts({ search, category }),
    fetchPublicCategories(),
  ]);
  const categories = configured ? storedCategories : defaultPublicCategories();

  return (
    <PublicShell>
      <header className="public-page-hero page-width">
        <h1>Reviewed products for your home</h1>
        <p>
          Clear recommendations, useful context, and verified Amazon.com
          destinations for US shoppers.
        </p>
      </header>
      <section className="public-listing page-width" aria-labelledby="product-results-heading">
        <form className="public-filters" action="/products" method="get" role="search">
          <label className="public-search-field" htmlFor="product-search">
            <span className="sr-only">Search products</span>
            <Search aria-hidden="true" />
            <input id="product-search" name="q" type="search" defaultValue={search} placeholder="Search home finds" />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select name="category" defaultValue={category}>
              <option value="">All categories</option>
              {categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="submit">Apply filters</button>
          {search || category ? <Link href="/products">Clear</Link> : null}
        </form>
        <div className="public-results-heading">
          <h2 id="product-results-heading">{search ? `Results for “${search}”` : "Published recommendations"}</h2>
          <span>{products.length} {products.length === 1 ? "item" : "items"}</span>
        </div>
        {products.length > 0 ? (
          <div className="public-product-grid">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
        ) : (
          <EmptyState
            title={configured ? "No recommendations match yet" : "Connect Supabase to publish products"}
            description={configured ? "Try a different search or category, or return after more products are reviewed." : "The catalog will use products published from your private admin."}
          />
        )}
      </section>
    </PublicShell>
  );
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
