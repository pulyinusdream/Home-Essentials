import type { Metadata } from "next";

import {
  CategoryCard,
  defaultPublicCategories,
} from "@/components/public/category-card";
import { PublicShell } from "@/components/public/public-shell";
import {
  fetchPublicCategories,
  publicContentIsConfigured,
} from "@/services/public/repository";

export const metadata: Metadata = {
  title: "Home categories",
  description: "Browse practical home essentials by room and household need.",
  alternates: { canonical: "/categories" },
};
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const configured = publicContentIsConfigured();
  const storedCategories = await fetchPublicCategories();
  const categories = configured ? storedCategories : defaultPublicCategories();

  return (
    <PublicShell>
      <header className="public-page-hero page-width">
        <p className="eyebrow">Browse by room</p>
        <h1>Essentials for the way your home works.</h1>
        <p>
          Start with a space, then explore practical recommendations and useful
          guides chosen for everyday routines.
        </p>
      </header>
      <section className="public-listing page-width" aria-label="Home categories">
        <div className="category-grid category-grid--catalog">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
