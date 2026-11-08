import type { ProductDraftInput } from "@/lib/validation/product";

export function slugifyProductName(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 180) || "product"
  );
}

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const list = (formData: FormData, key: string) =>
  formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);

export function productFormDataToInput(formData: FormData) {
  const name = text(formData, "name");
  const specificationNames = formData
    .getAll("specificationName")
    .map((value) => String(value).trim());
  const specificationValues = formData
    .getAll("specificationValue")
    .map((value) => String(value).trim());
  const specifications = specificationNames.flatMap((specificationName, index) => {
    const value = specificationValues[index];
    return specificationName && value ? [{ name: specificationName, value }] : [];
  });

  return {
    name,
    slug: text(formData, "slug") || slugifyProductName(name),
    categoryId: text(formData, "categoryId"),
    brand: text(formData, "brand"),
    model: text(formData, "model"),
    internalReference: text(formData, "internalReference"),
    subcategory: text(formData, "subcategory"),
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    features: list(formData, "feature"),
    specifications,
    recommendation: text(formData, "recommendation"),
    benefits: list(formData, "benefit"),
    pros: list(formData, "pro"),
    cons: list(formData, "con"),
    idealFor: text(formData, "idealFor"),
    thingsToConsider: text(formData, "thingsToConsider"),
    recommendedUse: text(formData, "recommendedUse"),
    mainImageUrl: text(formData, "mainImageUrl"),
    mainImageAlt: text(formData, "mainImageAlt"),
    asin: text(formData, "asin"),
    affiliateUrl: text(formData, "affiliateUrl"),
    affiliateConfirmed: formData.get("affiliateConfirmed") === "on",
    // Price values are deliberately not accepted from this administrative form.
    displayPrice: null,
    priceSource: "none" as const,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    focusKeyword: text(formData, "focusKeyword"),
    canonicalUrl: text(formData, "canonicalUrl"),
    socialTitle: text(formData, "socialTitle"),
    socialDescription: text(formData, "socialDescription"),
    socialImageUrl: text(formData, "socialImageUrl"),
  } satisfies ProductDraftInput;
}
