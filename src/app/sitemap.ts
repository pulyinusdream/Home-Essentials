import type { MetadataRoute } from "next";

import {
  fetchPublicArticles,
  fetchPublicCategories,
  fetchPublicProducts,
} from "@/services/public/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, articles] = await Promise.all([
    fetchPublicCategories(),
    fetchPublicProducts({ limit: 100 }),
    fetchPublicArticles({ limit: 100 }),
  ]);
  const paths = [
    "",
    "/categories",
    "/products",
    "/guides",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-use",
    "/affiliate-disclosure",
    ...categories.map((item) => `/categories/${item.slug}`),
    ...products.map((item) => `/products/${item.slug}`),
    ...articles.map((item) => `/guides/${item.slug}`),
  ];
  return [...new Set(paths)].map((path) => ({ url: absoluteUrl(path), changeFrequency: path === "" ? "weekly" : "monthly" }));
}

function absoluteUrl(path: string) {
  try { return new URL(path || "/", process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").toString(); }
  catch { return `http://127.0.0.1:3000${path}`; }
}
