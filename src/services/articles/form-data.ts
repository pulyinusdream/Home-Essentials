import { slugifyProductName } from "@/services/products/form-data";

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export function articleFormDataToInput(formData: FormData) {
  const title = text(formData, "title");
  let content: unknown = [];
  try {
    content = JSON.parse(text(formData, "content") || "[]");
  } catch {
    content = [{ type: "invalid" }];
  }

  return {
    title,
    slug: text(formData, "slug") || slugifyProductName(title),
    excerpt: text(formData, "excerpt"),
    content,
    featuredImageUrl: text(formData, "featuredImageUrl"),
    featuredImageAlt: text(formData, "featuredImageAlt"),
    categoryId: text(formData, "categoryId"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    focusKeyword: text(formData, "focusKeyword"),
    canonicalUrl: text(formData, "canonicalUrl"),
    socialTitle: text(formData, "socialTitle"),
    socialDescription: text(formData, "socialDescription"),
  };
}
