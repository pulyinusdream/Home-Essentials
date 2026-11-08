import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { articleBlockSchema, type ArticleBlock } from "@/lib/validation/article";
import type { ArticleRow, CategoryRow, ProductRow } from "@/types/database.types";
import { z } from "zod";

export class ArticleRepositoryError extends Error {
  constructor(message = "Buying guide data could not be loaded.") {
    super(message);
    this.name = "ArticleRepositoryError";
  }
}

export type ArticleListItem = Pick<
  ArticleRow,
  "id" | "title" | "slug" | "status" | "updated_at" | "published_at" | "category_id"
> & { category: Pick<CategoryRow, "name" | "slug"> | null };

export type ArticleEditorRecord = {
  article: ArticleRow;
  blocks: ArticleBlock[];
};

export async function fetchArticleList() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, updated_at, published_at, category_id")
    .order("updated_at", { ascending: false });
  if (error) throw new ArticleRepositoryError();

  const categoryIds = [
    ...new Set((data ?? []).map((article) => article.category_id).filter(Boolean)),
  ] as string[];
  const categories = new Map<string, Pick<CategoryRow, "name" | "slug">>();
  if (categoryIds.length > 0) {
    const result = await supabase
      .from("categories")
      .select("id, name, slug")
      .in("id", categoryIds);
    if (result.error) throw new ArticleRepositoryError();
    for (const category of result.data ?? []) {
      categories.set(category.id, { name: category.name, slug: category.slug });
    }
  }

  return (data ?? []).map((article): ArticleListItem => ({
    ...article,
    category: article.category_id
      ? categories.get(article.category_id) ?? null
      : null,
  }));
}

export async function fetchArticleEditorRecord(
  id: string,
): Promise<ArticleEditorRecord | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ArticleRepositoryError();
  if (!data) return null;

  const blocks = z.array(articleBlockSchema).safeParse(data.content);
  return { article: data, blocks: blocks.success ? blocks.data : [] };
}

export async function fetchArticleProductChoices() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, status, short_description, main_image_url, main_image_alt")
    .neq("status", "archived")
    .order("name", { ascending: true });
  if (error) throw new ArticleRepositoryError("Products could not be loaded.");
  return data ?? [];
}

export async function fetchRelatedArticleChoices(excludeId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("articles")
    .select("id, title, slug, status")
    .neq("status", "archived")
    .order("title", { ascending: true });
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new ArticleRepositoryError();
  return data ?? [];
}

export async function fetchPublishedProductsByIds(ids: string[]) {
  if (ids.length === 0) return [] as Array<Pick<ProductRow, "id">>;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, status, short_description, main_image_url, main_image_alt")
    .in("id", ids)
    .eq("status", "published");
  if (error) throw new ArticleRepositoryError();
  return data ?? [];
}
