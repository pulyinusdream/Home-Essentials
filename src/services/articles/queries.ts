import "server-only";

import { requireStaff } from "@/lib/auth/require-role";
import { fetchActiveProductCategories } from "@/services/products/repository";
import {
  fetchArticleEditorRecord,
  fetchArticleList,
  fetchArticleProductChoices,
  fetchRelatedArticleChoices,
} from "@/services/articles/repository";

export async function listArticles() {
  await requireStaff();
  return fetchArticleList();
}

export async function getArticleEditorRecord(id: string) {
  await requireStaff();
  return fetchArticleEditorRecord(id);
}

export async function getArticleEditorOptions(excludeArticleId?: string) {
  await requireStaff();
  const [categories, products, articles] = await Promise.all([
    fetchActiveProductCategories(),
    fetchArticleProductChoices(),
    fetchRelatedArticleChoices(excludeArticleId),
  ]);
  return { categories, products, articles };
}
