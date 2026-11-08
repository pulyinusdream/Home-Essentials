import { describe, expect, it } from "vitest";

import {
  productDraftSchema,
  productPublishSchema,
} from "@/lib/validation/product";
import { quickProductFormDataToInput } from "@/services/products/quick-add";

const CATEGORY_ID = "11111111-1111-4111-8111-111111111111";
const AFFILIATE_URL =
  "https://www.amazon.com/Vaunn-Medical-Adjustable-Overbed-Hospital/dp/B0DWG1P145?th=1&tag=homeessen0e2b-20";

function completeQuickForm(overrides: Record<string, string> = {}) {
  const values = {
    name: "Vaunn Adjustable Overbed Table",
    categoryId: CATEGORY_ID,
    recommendation:
      "A practical rolling table for people who need a stable surface beside a bed, couch, or wheelchair.",
    mainImageUrl: "https://images.example.com/vaunn-overbed-table.webp",
    affiliateUrl: AFFILIATE_URL,
    affiliateConfirmed: "on",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

describe("quick product entry", () => {
  it("maps six quick fields into a publishable product", () => {
    const input = quickProductFormDataToInput(completeQuickForm());

    expect(input).toMatchObject({
      name: "Vaunn Adjustable Overbed Table",
      slug: "vaunn-adjustable-overbed-table",
      categoryId: CATEGORY_ID,
      asin: "B0DWG1P145",
      affiliateUrl: AFFILIATE_URL,
      affiliateConfirmed: true,
      mainImageAlt: "Vaunn Adjustable Overbed Table",
      displayPrice: null,
      priceSource: "none",
    });
    expect(input.shortDescription).toBe(input.recommendation);
    expect(input.description).toBe(input.recommendation);
    expect(input.seoDescription).toBe(input.recommendation);
    expect(productPublishSchema.safeParse(input).success).toBe(true);
  });

  it("keeps a name-only draft valid", () => {
    const formData = new FormData();
    formData.set("name", "Draft bedside table");

    const input = quickProductFormDataToInput(formData);

    expect(input.slug).toBe("draft-bedside-table");
    expect(input.asin).toBe("");
    expect(productDraftSchema.safeParse(input).success).toBe(true);
  });

  it("does not trust a malformed Amazon URL", () => {
    const input = quickProductFormDataToInput(
      completeQuickForm({
        affiliateUrl:
          "https://amazon.com.evil.example/dp/B0DWG1P145?tag=homeessen0e2b-20",
      }),
    );

    expect(input.asin).toBe("");
    expect(productDraftSchema.safeParse(input).success).toBe(false);
  });

  it("requires a tracking ID for publication", () => {
    const input = quickProductFormDataToInput(
      completeQuickForm({
        affiliateUrl:
          "https://www.amazon.com/Vaunn-Medical-Adjustable-Overbed-Hospital/dp/B0DWG1P145?th=1",
      }),
    );

    expect(input.asin).toBe("B0DWG1P145");
    expect(productDraftSchema.safeParse(input).success).toBe(true);
    expect(productPublishSchema.safeParse(input).success).toBe(false);
  });

  it("truncates generated summaries without truncating the recommendation", () => {
    const recommendation = "a".repeat(620);
    const input = quickProductFormDataToInput(
      completeQuickForm({ recommendation }),
    );

    expect(input.recommendation).toHaveLength(620);
    expect(input.description).toBe(recommendation);
    expect(input.shortDescription).toHaveLength(500);
    expect(input.seoDescription).toHaveLength(500);
    expect(productPublishSchema.safeParse(input).success).toBe(true);
  });
});
