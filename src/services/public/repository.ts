import "server-only";

import { z } from "zod";

import type {
  ArticleProductCard,
  RelatedArticleCard,
} from "@/components/articles/article-renderer";
import { getPublicEnvironment } from "@/lib/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { articleBlockSchema, type ArticleBlock } from "@/lib/validation/article";
import type {
  ArticleRow,
  CategoryRow,
  ProductRow,
} from "@/types/database.types";

export type PublicCategory = Pick<
  CategoryRow,
  "id" | "name" | "slug" | "description" | "image_url" | "alt_text" | "is_featured"
>;

export type PublicProductCard = Pick<
  ProductRow,
  | "id"
  | "name"
  | "slug"
  | "brand"
  | "short_description"
  | "main_image_url"
  | "main_image_alt"
  | "display_price"
  | "currency"
  | "price_source"
  | "price_verified_at"
  | "is_featured"
> & { category: Pick<PublicCategory, "name" | "slug"> | null };

export type PublicProduct = ProductRow & {
  category: Pick<PublicCategory, "name" | "slug"> | null;
  affiliateUrl: string | null;
};

export type PublicArticleCard = Pick<
  ArticleRow,
  "id" | "title" | "slug" | "excerpt" | "featured_image_url" | "featured_image_alt" | "published_at"
> & { category: Pick<PublicCategory, "name" | "slug"> | null };

export type PublicArticle = {
  article: ArticleRow;
  category: Pick<PublicCategory, "name" | "slug"> | null;
  blocks: ArticleBlock[];
  productsById: ReadonlyMap<string, ArticleProductCard>;
  articlesById: ReadonlyMap<string, RelatedArticleCard>;
};

export class PublicContentError extends Error {
  constructor(message = "Published content could not be loaded.") {
    super(message);
    this.name = "PublicContentError";
  }
}

export function publicContentIsConfigured() {
  return getPublicEnvironment().configured;
}

export async function fetchPublicCategories(limit?: number) {
  if (!publicContentIsConfigured()) return [] as PublicCategory[];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("categories")
    .select("id, name, slug, description, image_url, alt_text, is_featured")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new PublicContentError("Categories could not be loaded.");
  return data ?? [];
}

export async function fetchPublicCategory(slug: string) {
  if (!publicContentIsConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, alt_text, is_featured")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new PublicContentError("The category could not be loaded.");
  return data;
}

export async function fetchPublicProducts({
  search,
  category,
  limit = 24,
}: {
  search?: string;
  category?: string;
  limit?: number;
} = {}) {
  if (!publicContentIsConfigured()) return [] as PublicProductCard[];
  const supabase = await createServerSupabaseClient();
  let categoryId: string | null = null;
  if (category) {
    const categoryResult = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (categoryResult.error) throw new PublicContentError();
    if (!categoryResult.data) return [];
    categoryId = categoryResult.data.id;
  }

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, brand, short_description, main_image_url, main_image_alt, display_price, currency, price_source, price_verified_at, is_featured, category_id",
    )
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search?.trim()) {
    const escaped = search.trim().replace(/[%_]/g, "\\$&").slice(0, 120);
    query = query.ilike("name", `%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw new PublicContentError("Products could not be loaded.");
  const categories = await categoryMap(
    (data ?? []).map((item) => item.category_id).filter((id): id is string => Boolean(id)),
  );
  return (data ?? []).map(({ category_id: categoryIdValue, ...product }) => ({
    ...product,
    category: categoryIdValue ? categories.get(categoryIdValue) ?? null : null,
  }));
}

export async function fetchPublicProduct(slug: string) {
  if (!publicContentIsConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new PublicContentError("The product could not be loaded.");
  if (!data) return null;
  const [categories, affiliateResult] = await Promise.all([
    categoryMap(data.category_id ? [data.category_id] : []),
    supabase
      .from("affiliate_links")
      .select("affiliate_url")
      .eq("product_id", data.id)
      .eq("marketplace", "US")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (affiliateResult.error) {
    throw new PublicContentError("The verified product link could not be loaded.");
  }
  return {
    ...data,
    category: data.category_id ? categories.get(data.category_id) ?? null : null,
    affiliateUrl: affiliateResult.data?.affiliate_url ?? null,
  } satisfies PublicProduct;
}

export async function fetchPublicArticles({
  category,
  limit = 24,
}: {
  category?: string;
  limit?: number;
} = {}) {
  if (!publicContentIsConfigured()) return [] as PublicArticleCard[];
  const supabase = await createServerSupabaseClient();
  let categoryId: string | null = null;
  if (category) {
    const result = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (result.error) throw new PublicContentError();
    if (!result.data) return [];
    categoryId = result.data.id;
  }

  let query = supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, featured_image_url, featured_image_alt, published_at, category_id",
    )
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw new PublicContentError("Buying guides could not be loaded.");
  const categories = await categoryMap(
    (data ?? []).map((item) => item.category_id).filter((id): id is string => Boolean(id)),
  );
  return (data ?? []).map(({ category_id: categoryIdValue, ...article }) => ({
    ...article,
    category: categoryIdValue ? categories.get(categoryIdValue) ?? null : null,
  }));
}

export async function fetchPublicArticle(slug: string): Promise<PublicArticle | null> {
  if (!publicContentIsConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new PublicContentError("The buying guide could not be loaded.");
  if (!article) return null;

  const parsedBlocks = z.array(articleBlockSchema).safeParse(article.content);
  const blocks = parsedBlocks.success ? parsedBlocks.data : [];
  const productIds = blocks
    .filter((block): block is Extract<ArticleBlock, { type: "product" }> => block.type === "product")
    .map((block) => block.productId);
  const articleIds = blocks
    .filter((block): block is Extract<ArticleBlock, { type: "relatedArticle" }> => block.type === "relatedArticle")
    .map((block) => block.articleId);

  const [products, relatedArticles, categories] = await Promise.all([
    fetchArticleProducts(productIds),
    fetchRelatedArticles(articleIds),
    categoryMap(article.category_id ? [article.category_id] : []),
  ]);

  return {
    article,
    category: article.category_id ? categories.get(article.category_id) ?? null : null,
    blocks,
    productsById: new Map(products.map((product) => [product.id, product])),
    articlesById: new Map(relatedArticles.map((item) => [item.id, item])),
  };
}

async function categoryMap(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  const result = new Map<string, Pick<PublicCategory, "name" | "slug">>();
  if (uniqueIds.length === 0) return result;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .in("id", uniqueIds);
  if (error) throw new PublicContentError();
  for (const category of data ?? []) {
    result.set(category.id, { name: category.name, slug: category.slug });
  }
  return result;
}

async function fetchArticleProducts(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [] as ArticleProductCard[];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, short_description, main_image_url, main_image_alt")
    .in("id", uniqueIds);
  if (error) throw new PublicContentError();
  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description,
    imageUrl: product.main_image_url,
    imageAlt: product.main_image_alt,
  }));
}

async function fetchRelatedArticles(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [] as RelatedArticleCard[];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug")
    .in("id", uniqueIds);
  if (error) throw new PublicContentError();
  return data ?? [];
}
