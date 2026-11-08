import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AffiliateLinkRow,
  CategoryRow,
  ProductRow,
} from "@/types/database.types";
import type { ProductListFilters } from "@/services/products/workflow";

export type ProductListItem = Pick<
  ProductRow,
  | "id"
  | "name"
  | "slug"
  | "brand"
  | "status"
  | "main_image_url"
  | "published_at"
  | "updated_at"
  | "category_id"
> & {
  category: Pick<CategoryRow, "name" | "slug"> | null;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ProductEditorRecord = {
  product: ProductRow;
  affiliateLink: AffiliateLinkRow | null;
};

export class ProductRepositoryError extends Error {
  constructor(message = "The product data could not be loaded.") {
    super(message);
    this.name = "ProductRepositoryError";
  }
}

export async function fetchProductList(
  filters: ProductListFilters,
): Promise<ProductListResult> {
  const supabase = await createServerSupabaseClient();
  let categoryId: string | null = null;

  if (filters.category) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();

    if (categoryError) throw new ProductRepositoryError();
    if (!category) {
      return {
        items: [],
        total: 0,
        page: filters.page,
        perPage: filters.perPage,
        totalPages: 1,
      };
    }
    categoryId = category.id;
  }

  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, brand, status, main_image_url, published_at, updated_at, category_id",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.search) {
    const escapedSearch = filters.search.replace(/[%_]/g, "\\$&");
    query = query.ilike("name", `%${escapedSearch}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new ProductRepositoryError();

  const categoryIds = [
    ...new Set((data ?? []).map((product) => product.category_id).filter(Boolean)),
  ] as string[];
  const categoryById = new Map<string, Pick<CategoryRow, "name" | "slug">>();

  if (categoryIds.length > 0) {
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .in("id", categoryIds);
    if (categoriesError) throw new ProductRepositoryError();
    for (const category of categories ?? []) {
      categoryById.set(category.id, {
        name: category.name,
        slug: category.slug,
      });
    }
  }

  const total = count ?? 0;
  return {
    items: (data ?? []).map((product) => ({
      ...product,
      category: product.category_id
        ? categoryById.get(product.category_id) ?? null
        : null,
    })),
    total,
    page: filters.page,
    perPage: filters.perPage,
    totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
  };
}

export async function fetchActiveProductCategories() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new ProductRepositoryError("Categories could not be loaded.");
  return data ?? [];
}

export async function fetchProductEditorRecord(
  id: string,
): Promise<ProductEditorRecord | null> {
  const supabase = await createServerSupabaseClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (productError) throw new ProductRepositoryError();
  if (!product) return null;

  const { data: affiliateLink, error: affiliateError } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("product_id", id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (affiliateError) throw new ProductRepositoryError();
  return { product, affiliateLink };
}
