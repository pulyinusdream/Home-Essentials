import { validateAmazonUrl } from "@/lib/affiliate/url";
import type { ProductDraftInput } from "@/lib/validation/product";
import { slugifyProductName } from "@/services/products/form-data";

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export function quickProductFormDataToInput(formData: FormData) {
  const name = text(formData, "name");
  const recommendation = text(formData, "recommendation");
  const affiliateUrl = text(formData, "affiliateUrl");
  const affiliateValidation = validateAmazonUrl(affiliateUrl);
  const summary = recommendation.slice(0, 500);

  return {
    name,
    slug: slugifyProductName(name),
    categoryId: text(formData, "categoryId"),
    brand: "",
    model: "",
    internalReference: "",
    subcategory: "",
    shortDescription: summary,
    description: recommendation,
    features: [],
    specifications: [],
    recommendation,
    benefits: [],
    pros: [],
    cons: [],
    idealFor: "",
    thingsToConsider: "",
    recommendedUse: "",
    mainImageUrl: text(formData, "mainImageUrl"),
    mainImageAlt: name,
    asin: affiliateValidation.valid ? affiliateValidation.asin : "",
    affiliateUrl,
    affiliateConfirmed: formData.get("affiliateConfirmed") === "on",
    displayPrice: null,
    priceSource: "none" as const,
    seoTitle: "",
    seoDescription: summary,
    focusKeyword: "",
    canonicalUrl: "",
    socialTitle: "",
    socialDescription: "",
    socialImageUrl: "",
  } satisfies ProductDraftInput;
}
