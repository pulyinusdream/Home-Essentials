"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  articleDraftSchema,
  articlePublishSchema,
  type ArticleBlock,
  type ArticleDraftInput,
} from "@/lib/validation/article";
import type { ArticleActionState } from "@/services/articles/action-state";
import { articleFormDataToInput } from "@/services/articles/form-data";
import { fetchArticleEditorRecord } from "@/services/articles/repository";
import {
  createDuplicateArticleValues,
  referencedProductIds,
  validateReferencedProducts,
} from "@/services/articles/workflow";
import type {
  ArticleRow,
  Database,
  Json,
  PublicationStatus,
} from "@/types/database.types";

type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];

export async function createArticleAction(
  previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  void previousState;
  const session = await requireStaff();
  const intent = getIntent(formData);
  const parsed = parseArticleInput(articleFormDataToInput(formData), intent);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);

  const referenceError = await checkProductReferences(parsed.data.content, intent);
  if (referenceError) return referenceError;

  const supabase = await createServerSupabaseClient();
  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      ...articleInputToValues(parsed.data),
      author_id: session.user.id,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !article) return databaseFailure(error?.code);

  const relationError = await syncArticleProducts(article.id, parsed.data.content);
  if (relationError) {
    return {
      status: "error",
      message: "The draft was saved, but product recommendations could not be linked.",
      fieldErrors: { content: [relationError] },
    };
  }

  const status = intentToStatus(intent);
  if (status !== "draft") {
    const result = await supabase.from("articles").update({ status }).eq("id", article.id);
    if (result.error) {
      return {
        status: "error",
        message: "The draft was saved, but its publication status could not be changed.",
        fieldErrors: {},
      };
    }
  }

  revalidateArticlePaths(article.id, parsed.data.slug ?? "");
  redirect(`/admin/articles/${article.id}/edit?saved=1`);
}

export async function updateArticleAction(
  articleId: string,
  previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  void previousState;
  await requireStaff();
  const record = await fetchArticleEditorRecord(articleId);
  if (!record) return databaseFailure("not_found");

  const intent = getIntent(formData);
  const parsed = parseArticleInput(articleFormDataToInput(formData), intent);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);
  const referenceError = await checkProductReferences(parsed.data.content, intent);
  if (referenceError) return referenceError;

  const supabase = await createServerSupabaseClient();
  if (record.article.status === "published") {
    const result = await supabase
      .from("articles")
      .update({ status: "draft", published_at: null })
      .eq("id", articleId);
    if (result.error) return databaseFailure(result.error.code);
  }

  const status = intentToStatus(intent);
  const values: ArticleUpdate = {
    ...articleInputToValues(parsed.data),
    status,
    published_at: status === "published" ? record.article.published_at : null,
  };
  const result = await supabase.from("articles").update(values).eq("id", articleId);
  if (result.error) return databaseFailure(result.error.code);

  const relationError = await syncArticleProducts(articleId, parsed.data.content);
  if (relationError) return fieldFailure("content", relationError);

  revalidateArticlePaths(articleId, parsed.data.slug ?? record.article.slug);
  redirect(`/admin/articles/${articleId}/edit?saved=1`);
}

export async function duplicateArticleAction(formData: FormData) {
  const session = await requireStaff();
  const articleId = String(formData.get("articleId") ?? "");
  const record = await fetchArticleEditorRecord(articleId);
  if (!record) redirect("/admin/articles?notice=not-found");

  const duplicate = createDuplicateArticleValues(
    record.article,
    `copy-${crypto.randomUUID().slice(0, 8)}`,
  );
  const values = copyArticleRowForInsert(record.article, duplicate, session.user.id);
  const supabase = await createServerSupabaseClient();
  const result = await supabase.from("articles").insert(values).select("id").single();
  if (result.error || !result.data) redirect("/admin/articles?notice=duplicate-failed");

  await syncArticleProducts(result.data.id, record.blocks);
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${result.data.id}/edit?duplicated=1`);
}

export async function changeArticleStatusAction(formData: FormData) {
  await requireStaff();
  const articleId = String(formData.get("articleId") ?? "");
  const status = String(formData.get("status") ?? "") as PublicationStatus;
  const record = await fetchArticleEditorRecord(articleId);
  if (!record) redirect("/admin/articles?notice=not-found");
  if (!isAllowedTransition(record.article.status, status)) {
    redirect("/admin/articles?notice=invalid-transition");
  }

  if (status === "published") {
    const input = rowToArticleInput(record.article, record.blocks);
    const validation = articlePublishSchema.safeParse(input);
    if (!validation.success) redirect("/admin/articles?notice=publish-incomplete");
    const referenceError = await checkProductReferences(record.blocks, "publish");
    if (referenceError) redirect("/admin/articles?notice=product-unavailable");
  }

  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("articles")
    .update({
      status,
      published_at: status === "published" ? record.article.published_at : null,
    })
    .eq("id", articleId);
  if (result.error) redirect("/admin/articles?notice=status-failed");

  revalidateArticlePaths(articleId, record.article.slug);
  redirect("/admin/articles?notice=status-updated");
}

export async function deleteArticleAction(formData: FormData) {
  await requireStaff();
  const articleId = String(formData.get("articleId") ?? "");
  const record = await fetchArticleEditorRecord(articleId);
  if (!record) redirect("/admin/articles?notice=not-found");
  if (record.article.status !== "draft" && record.article.status !== "archived") {
    redirect("/admin/articles?notice=archive-before-delete");
  }

  const supabase = await createServerSupabaseClient();
  const result = await supabase.from("articles").delete().eq("id", articleId);
  if (result.error) redirect("/admin/articles?notice=delete-failed");
  revalidatePath("/admin/articles");
  revalidatePath(`/guides/${record.article.slug}`);
  redirect("/admin/articles?notice=deleted");
}

function getIntent(formData: FormData) {
  const value = String(formData.get("intent") ?? "draft");
  return value === "publish" || value === "review" ? value : "draft";
}

function intentToStatus(intent: ReturnType<typeof getIntent>): PublicationStatus {
  if (intent === "publish") return "published";
  if (intent === "review") return "pending_review";
  return "draft";
}

function parseArticleInput(
  input: ReturnType<typeof articleFormDataToInput>,
  intent: ReturnType<typeof getIntent>,
) {
  return intent === "publish"
    ? articlePublishSchema.safeParse(input)
    : articleDraftSchema.safeParse(input);
}

async function checkProductReferences(
  blocks: ArticleBlock[],
  intent: ReturnType<typeof getIntent>,
): Promise<ArticleActionState | null> {
  const ids = referencedProductIds(blocks);
  if (ids.length === 0) return null;

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("products").select("id").in("id", ids);
  if (intent === "publish") query = query.eq("status", "published");
  const result = await query;
  if (result.error) return fieldFailure("content", "Product recommendations could not be checked.");
  const available = new Set((result.data ?? []).map((product) => product.id));
  const unavailable = validateReferencedProducts(blocks, available);
  return unavailable.length > 0
    ? fieldFailure(
        "content",
        intent === "publish"
          ? "Every recommended product must be published before this guide."
          : "A product recommendation no longer exists.",
      )
    : null;
}

async function syncArticleProducts(articleId: string, blocks: ArticleBlock[]) {
  const supabase = await createServerSupabaseClient();
  const removed = await supabase.from("article_products").delete().eq("article_id", articleId);
  if (removed.error) return "Existing product links could not be updated.";

  const productBlocks = blocks.filter(
    (block): block is Extract<ArticleBlock, { type: "product" }> =>
      block.type === "product",
  );
  const seen = new Set<string>();
  const rows = productBlocks.flatMap((block, index) => {
    if (seen.has(block.productId)) return [];
    seen.add(block.productId);
    return [
      {
        article_id: articleId,
        product_id: block.productId,
        display_order: index,
        note: block.note || null,
      },
    ];
  });
  if (rows.length === 0) return null;
  const inserted = await supabase.from("article_products").insert(rows);
  return inserted.error ? "Product recommendation links could not be saved." : null;
}

function articleInputToValues(input: ArticleDraftInput): ArticleInsert {
  return {
    title: input.title,
    slug: input.slug ?? "guide",
    excerpt: input.excerpt,
    content: input.content as Json,
    featured_image_url: input.featuredImageUrl,
    featured_image_alt: input.featuredImageAlt,
    category_id: input.categoryId,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    focus_keyword: input.focusKeyword,
    canonical_url: input.canonicalUrl,
    social_title: input.socialTitle,
    social_description: input.socialDescription,
  };
}

function rowToArticleInput(article: ArticleRow, blocks: ArticleBlock[]) {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: blocks,
    featuredImageUrl: article.featured_image_url,
    featuredImageAlt: article.featured_image_alt,
    categoryId: article.category_id,
    seoTitle: article.seo_title,
    seoDescription: article.seo_description,
    focusKeyword: article.focus_keyword,
    canonicalUrl: article.canonical_url,
    socialTitle: article.social_title,
    socialDescription: article.social_description,
  };
}

function copyArticleRowForInsert(
  article: ArticleRow,
  duplicate: ReturnType<typeof createDuplicateArticleValues>,
  authorId: string,
): ArticleInsert {
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...copyable
  } = article;
  void _id;
  void _createdAt;
  void _updatedAt;
  return { ...copyable, ...duplicate, author_id: authorId };
}

function isAllowedTransition(current: PublicationStatus, next: PublicationStatus) {
  const transitions: Record<PublicationStatus, PublicationStatus[]> = {
    draft: ["draft", "pending_review", "published", "archived"],
    pending_review: ["draft", "pending_review", "published", "archived"],
    published: ["draft", "published", "archived"],
    archived: ["draft", "archived"],
  };
  return transitions[current].includes(next);
}

function validationFailure(
  errors: Record<string, string[] | undefined>,
): ArticleActionState {
  return {
    status: "error",
    message: "Review the highlighted guide sections before saving.",
    fieldErrors: Object.fromEntries(
      Object.entries(errors).filter((entry): entry is [string, string[]] =>
        Boolean(entry[1]),
      ),
    ),
  };
}

function fieldFailure(field: string, message: string): ArticleActionState {
  return { status: "error", message, fieldErrors: { [field]: [message] } };
}

function databaseFailure(code?: string): ArticleActionState {
  return {
    status: "error",
    message:
      code === "23505"
        ? "That guide slug is already in use."
        : "The buying guide could not be saved. Try again without refreshing.",
    fieldErrors: {},
  };
}

function revalidateArticlePaths(id: string, slug: string) {
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}/edit`);
  if (slug) revalidatePath(`/guides/${slug}`);
  revalidatePath("/");
}
