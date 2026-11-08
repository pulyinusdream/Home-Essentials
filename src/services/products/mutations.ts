"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateAmazonUrl } from "@/lib/affiliate/url";
import { can } from "@/lib/auth/permissions";
import { requireStaff, type StaffSession } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  productDraftSchema,
  productPublishSchema,
  type ProductDraftInput,
} from "@/lib/validation/product";
import type { ProductActionState } from "@/services/products/action-state";
import { productFormDataToInput } from "@/services/products/form-data";
import { quickProductFormDataToInput } from "@/services/products/quick-add";
import { fetchProductEditorRecord } from "@/services/products/repository";
import {
  canDeleteProduct,
  canTransitionProductStatus,
  createDuplicateProductValues,
} from "@/services/products/workflow";
import type {
  AffiliateLinkRow,
  Database,
  Json,
  ProductRow,
  PublicationStatus,
  StaffRole,
} from "@/types/database.types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function createProductAction(
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  void previousState;
  const session = await requireStaff();
  const input = productFormDataToInput(formData);
  const intent = getIntent(formData);
  const parsed = parseProductInput(input, intent);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);

  if (
    parsed.data.affiliateUrl &&
    !can(session.profile.role, "affiliateLinks.manage")
  ) {
    return fieldFailure(
      "affiliateUrl",
      "Only an administrator can add or verify affiliate links.",
    );
  }

  return createProductRecord(session, parsed.data, intent);
}

export async function createQuickProductAction(
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  void previousState;
  const session = await requireStaff();
  const input = quickProductFormDataToInput(formData);
  const intent = getIntent(formData);
  const parsed = parseProductInput(input, intent);
  if (!parsed.success) {
    return quickValidationFailure(parsed.error.flatten().fieldErrors);
  }

  if (
    parsed.data.affiliateUrl &&
    !can(session.profile.role, "affiliateLinks.manage")
  ) {
    return fieldFailure(
      "affiliateUrl",
      "Only an administrator can add or verify affiliate links.",
    );
  }

  return createProductRecord(session, parsed.data, intent);
}

async function createProductRecord(
  session: StaffSession,
  input: ProductDraftInput,
  intent: ReturnType<typeof getIntent>,
): Promise<ProductActionState> {
  const supabase = await createServerSupabaseClient();
  const values = productInputToValues(input, session.user.id);
  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...values, status: "draft" })
    .select("id")
    .single();

  if (error || !product) return databaseFailure(error?.code);

  const affiliateError = await saveAffiliateLink(
    product.id,
    input,
    session.profile.role,
  );
  if (affiliateError) {
    return {
      status: "error",
      message: `The draft was created, but ${affiliateError}`,
      fieldErrors: { affiliateUrl: [affiliateError] },
    };
  }

  const targetStatus = intentToStatus(intent);
  if (targetStatus !== "draft") {
    const { error: statusError } = await supabase
      .from("products")
      .update({ status: targetStatus })
      .eq("id", product.id);
    if (statusError) {
      return {
        status: "error",
        message:
          "The draft was saved, but it could not be published. Review the required sections.",
        fieldErrors: {},
      };
    }
  }

  revalidateProductPaths(product.id, input.slug ?? "");
  redirect(`/admin/products/${product.id}/edit?saved=1`);
}

export async function updateProductAction(
  productId: string,
  previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  void previousState;
  const session = await requireStaff();
  const current = await fetchProductEditorRecord(productId);
  if (!current) return databaseFailure("not_found");

  const input = productFormDataToInput(formData);
  const intent = getIntent(formData);
  const parsed = parseProductInput(input, intent);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);

  const affiliateChanged =
    (current.affiliateLink?.affiliate_url ?? "") !==
      (parsed.data.affiliateUrl ?? "") ||
    Boolean(current.affiliateLink?.status === "active") !==
      parsed.data.affiliateConfirmed;

  if (
    affiliateChanged &&
    !can(session.profile.role, "affiliateLinks.manage")
  ) {
    return fieldFailure(
      "affiliateUrl",
      "Only an administrator can change or verify affiliate links.",
    );
  }

  const supabase = await createServerSupabaseClient();
  if (current.product.status === "published") {
    const { error: unpublishError } = await supabase
      .from("products")
      .update({ status: "draft", published_at: null })
      .eq("id", productId);
    if (unpublishError) return databaseFailure(unpublishError.code);
  }

  const affiliateError = await saveAffiliateLink(
    productId,
    parsed.data,
    session.profile.role,
  );
  if (affiliateError) return fieldFailure("affiliateUrl", affiliateError);

  const status = intentToStatus(intent);
  const values: ProductUpdate = {
    ...productInputToValues(parsed.data, current.product.created_by),
    status,
    published_at: status === "published" ? current.product.published_at : null,
  };
  delete values.created_by;

  const { error } = await supabase
    .from("products")
    .update(values)
    .eq("id", productId);
  if (error) return databaseFailure(error.code);

  revalidateProductPaths(productId, parsed.data.slug ?? current.product.slug);
  redirect(`/admin/products/${productId}/edit?saved=1`);
}

export async function duplicateProductAction(formData: FormData) {
  const session = await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const source = await fetchProductEditorRecord(productId);
  if (!source) redirect("/admin/products?notice=not-found");

  const supabase = await createServerSupabaseClient();
  const duplicateValues = createDuplicateProductValues(
    source.product,
    `copy-${crypto.randomUUID().slice(0, 8)}`,
  );
  const values = copyProductRowForInsert(
    source.product,
    duplicateValues,
    session.user.id,
  );
  const { data: duplicate, error } = await supabase
    .from("products")
    .insert(values)
    .select("id")
    .single();

  if (error || !duplicate) redirect("/admin/products?notice=duplicate-failed");

  if (source.affiliateLink) {
    await supabase.from("affiliate_links").insert({
      product_id: duplicate.id,
      marketplace: source.affiliateLink.marketplace,
      asin: source.affiliateLink.asin,
      tracking_id: source.affiliateLink.tracking_id,
      affiliate_url: source.affiliateLink.affiliate_url,
      status: "unverified",
      last_verified_at: null,
    });
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${duplicate.id}/edit?duplicated=1`);
}

export async function changeProductStatusAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "") as PublicationStatus;
  const record = await fetchProductEditorRecord(productId);
  if (!record) redirect("/admin/products?notice=not-found");

  if (!canTransitionProductStatus(record.product.status, requestedStatus)) {
    redirect("/admin/products?notice=invalid-transition");
  }

  if (requestedStatus === "published") {
    const validation = productPublishSchema.safeParse(
      rowToProductInput(record.product, record.affiliateLink),
    );
    if (!validation.success) redirect("/admin/products?notice=publish-incomplete");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({
      status: requestedStatus,
      published_at:
        requestedStatus === "published" ? record.product.published_at : null,
    })
    .eq("id", productId);

  if (error) redirect("/admin/products?notice=status-failed");
  revalidateProductPaths(productId, record.product.slug);
  redirect("/admin/products?notice=status-updated");
}

export async function deleteProductAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const record = await fetchProductEditorRecord(productId);
  if (!record) redirect("/admin/products?notice=not-found");
  if (!canDeleteProduct(record.product.status)) {
    redirect("/admin/products?notice=archive-before-delete");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) redirect("/admin/products?notice=delete-failed");

  revalidatePath("/admin/products");
  revalidatePath(`/products/${record.product.slug}`);
  redirect("/admin/products?notice=deleted");
}

function getIntent(formData: FormData) {
  const candidate = String(formData.get("intent") ?? "draft");
  return candidate === "publish" || candidate === "review"
    ? candidate
    : "draft";
}

function intentToStatus(intent: ReturnType<typeof getIntent>): PublicationStatus {
  if (intent === "publish") return "published";
  if (intent === "review") return "pending_review";
  return "draft";
}

function parseProductInput(
  input: ReturnType<typeof productFormDataToInput>,
  intent: ReturnType<typeof getIntent>,
) {
  return intent === "publish"
    ? productPublishSchema.safeParse(input)
    : productDraftSchema.safeParse(input);
}

function validationFailure(
  fieldErrors: Record<string, string[] | undefined>,
): ProductActionState {
  return {
    status: "error",
    message: "Review the highlighted sections before saving.",
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
        Boolean(entry[1]),
      ),
    ),
  };
}

function quickValidationFailure(
  fieldErrors: Record<string, string[] | undefined>,
): ProductActionState {
  const visibleFields: Record<string, string[]> = {};
  const collect = (target: string, sources: string[]) => {
    const messages = sources.flatMap((source) => fieldErrors[source] ?? []);
    if (messages.length > 0) visibleFields[target] = [...new Set(messages)];
  };

  collect("name", ["name", "slug"]);
  collect("categoryId", ["categoryId"]);
  collect("recommendation", [
    "recommendation",
    "shortDescription",
    "description",
    "seoDescription",
  ]);
  collect("mainImageUrl", ["mainImageUrl", "mainImageAlt"]);
  collect("affiliateUrl", ["affiliateUrl", "asin"]);
  collect("affiliateConfirmed", ["affiliateConfirmed"]);

  return validationFailure(visibleFields);
}

function fieldFailure(field: string, message: string): ProductActionState {
  return { status: "error", message, fieldErrors: { [field]: [message] } };
}

function databaseFailure(code?: string): ProductActionState {
  const duplicate = code === "23505";
  return {
    status: "error",
    message: duplicate
      ? "That slug or internal reference is already in use."
      : "The product could not be saved. Try again without refreshing the page.",
    fieldErrors: {},
  };
}

function productInputToValues(
  input: ProductDraftInput,
  createdBy: string | null,
): ProductInsert {
  return {
    category_id: input.categoryId,
    name: input.name,
    slug: input.slug ?? "product",
    brand: input.brand,
    model: input.model,
    internal_reference: input.internalReference,
    subcategory: input.subcategory,
    short_description: input.shortDescription,
    description: input.description,
    specifications: Object.fromEntries(
      input.specifications.map(({ name, value }) => [name, value]),
    ),
    features: input.features,
    recommendation: input.recommendation,
    benefits: input.benefits,
    pros: input.pros,
    cons: input.cons,
    ideal_for: input.idealFor,
    things_to_consider: input.thingsToConsider,
    recommended_use: input.recommendedUse,
    main_image_url: input.mainImageUrl,
    main_image_alt: input.mainImageAlt,
    display_price: null,
    currency: "USD",
    price_source: "none",
    price_verified_at: null,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    focus_keyword: input.focusKeyword,
    canonical_url: input.canonicalUrl,
    social_title: input.socialTitle,
    social_description: input.socialDescription,
    social_image_url: input.socialImageUrl,
    created_by: createdBy,
  };
}

async function saveAffiliateLink(
  productId: string,
  input: ProductDraftInput,
  role: StaffRole,
) {
  const supabase = await createServerSupabaseClient();
  const { data: existing, error: readError } = await supabase
    .from("affiliate_links")
    .select("id, affiliate_url, status")
    .eq("product_id", productId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readError) return "the affiliate link could not be checked.";

  if (!can(role, "affiliateLinks.manage")) {
    if (!input.affiliateUrl || input.affiliateUrl === existing?.affiliate_url) return null;
    return "only an administrator can change affiliate links.";
  }

  if (!input.affiliateUrl) {
    if (existing) {
      const { error } = await supabase
        .from("affiliate_links")
        .update({ status: "inactive", last_verified_at: null })
        .eq("id", existing.id);
      if (error) return "the affiliate link could not be deactivated.";
    }
    return null;
  }

  const validation = validateAmazonUrl(input.affiliateUrl, {
    expectedAsin: input.asin,
  });
  if (!validation.valid) return validation.reason;

  const active = input.affiliateConfirmed && Boolean(validation.trackingId);
  const values = {
    product_id: productId,
    marketplace: "US",
    asin: validation.asin,
    tracking_id: validation.trackingId,
    affiliate_url: validation.url,
    status: active ? ("active" as const) : ("unverified" as const),
    last_verified_at: active ? new Date().toISOString() : null,
  };
  const result = existing
    ? await supabase.from("affiliate_links").update(values).eq("id", existing.id)
    : await supabase.from("affiliate_links").insert(values);
  return result.error ? "the affiliate link could not be saved." : null;
}

function copyProductRowForInsert(
  product: ProductRow,
  duplicate: ReturnType<typeof createDuplicateProductValues>,
  createdBy: string,
): ProductInsert {
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    internal_reference: _internalReference,
    ...copyable
  } = product;
  void _id;
  void _createdAt;
  void _updatedAt;
  void _internalReference;

  return {
    ...copyable,
    ...duplicate,
    internal_reference: null,
    created_by: createdBy,
  };
}

function rowToProductInput(
  product: ProductRow,
  affiliateLink: AffiliateLinkRow | null,
) {
  const stringArray = (value: Json) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const specifications =
    product.specifications &&
    typeof product.specifications === "object" &&
    !Array.isArray(product.specifications)
      ? Object.entries(product.specifications).flatMap(([name, value]) =>
          typeof value === "string" ? [{ name, value }] : [],
        )
      : [];

  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,
    brand: product.brand,
    model: product.model,
    internalReference: product.internal_reference,
    subcategory: product.subcategory,
    shortDescription: product.short_description,
    description: product.description,
    features: stringArray(product.features),
    specifications,
    recommendation: product.recommendation,
    benefits: stringArray(product.benefits),
    pros: stringArray(product.pros),
    cons: stringArray(product.cons),
    idealFor: product.ideal_for,
    thingsToConsider: product.things_to_consider,
    recommendedUse: product.recommended_use,
    mainImageUrl: product.main_image_url,
    mainImageAlt: product.main_image_alt,
    asin: affiliateLink?.asin,
    affiliateUrl: affiliateLink?.affiliate_url,
    affiliateConfirmed:
      affiliateLink?.status === "active" && Boolean(affiliateLink.last_verified_at),
    displayPrice: product.display_price,
    priceSource: product.price_source,
    seoTitle: product.seo_title,
    seoDescription: product.seo_description,
    focusKeyword: product.focus_keyword,
    canonicalUrl: product.canonical_url,
    socialTitle: product.social_title,
    socialDescription: product.social_description,
    socialImageUrl: product.social_image_url,
  };
}

function revalidateProductPaths(productId: string, slug: string) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}
