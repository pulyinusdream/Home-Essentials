import { describe, expect, it } from "vitest";

import {
  productDraftSchema,
  productPublishSchema,
} from "@/lib/validation/product";

const completeProduct = {
  name: "Expandable Bamboo Drawer Organizer",
  slug: "expandable-bamboo-drawer-organizer",
  categoryId: "11111111-1111-4111-8111-111111111111",
  brand: "Example brand",
  model: "BO-01",
  internalReference: "HE-KIT-001",
  subcategory: "Kitchen organization",
  shortDescription: "An adjustable organizer for everyday kitchen tools.",
  description:
    "A practical organizer with adjustable width and clearly separated compartments.",
  features: ["Expandable width", "Bamboo construction"],
  specifications: [{ name: "Width", value: "13–19 inches" }],
  recommendation:
    "A strong fit for drawers that need flexible, visible organization.",
  benefits: ["Makes utensils easier to find"],
  pros: ["Adjustable"],
  cons: ["Measure the drawer first"],
  idealFor: "Busy kitchens with mixed utensils",
  thingsToConsider: "Confirm the closed and expanded dimensions.",
  recommendedUse: "Use in a dry indoor drawer.",
  mainImageUrl: "https://images.example.com/organizer.webp",
  mainImageAlt: "Expandable bamboo organizer inside a kitchen drawer",
  asin: "B0ABC12345",
  affiliateUrl:
    "https://www.amazon.com/dp/B0ABC12345?tag=homeessential-20",
  affiliateConfirmed: true,
  seoTitle: "Expandable Bamboo Drawer Organizer",
  seoDescription:
    "See who this expandable bamboo drawer organizer suits, what to measure, and what to consider before buying.",
  focusKeyword: "bamboo drawer organizer",
  canonicalUrl: "",
  socialTitle: "",
  socialDescription: "",
  socialImageUrl: "",
};

describe("product editor validation", () => {
  it("allows a minimal named draft", () => {
    const result = productDraftSchema.safeParse({ name: "Draft product" });
    expect(result.success).toBe(true);
  });

  it("accepts a complete publishable recommendation", () => {
    const result = productPublishSchema.safeParse(completeProduct);
    expect(result.success).toBe(true);
  });

  it.each([
    ["categoryId", ""],
    ["description", ""],
    ["shortDescription", ""],
    ["recommendation", ""],
    ["mainImageUrl", ""],
    ["mainImageAlt", ""],
    ["seoDescription", ""],
    ["affiliateConfirmed", false],
  ] as const)("blocks publication when %s is missing", (field, value) => {
    const result = productPublishSchema.safeParse({
      ...completeProduct,
      [field]: value,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a deceptive affiliate URL even for a draft", () => {
    const result = productDraftSchema.safeParse({
      name: "Draft product",
      affiliateUrl: "https://amazon.com.evil.example/dp/B0ABC12345",
    });
    expect(result.success).toBe(false);
  });

  it("does not accept manually entered public prices", () => {
    const result = productDraftSchema.safeParse({
      name: "Draft product",
      displayPrice: "29.99",
      priceSource: "none",
    });
    expect(result.success).toBe(false);
  });
});
