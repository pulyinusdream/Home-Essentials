import { describe, expect, it } from "vitest";

import {
  articleBlockSchema,
  articleDraftSchema,
  articlePublishSchema,
} from "@/lib/validation/article";

const id = "11111111-1111-4111-8111-111111111111";

describe("structured buying guide validation", () => {
  it.each([
    { id, type: "paragraph", text: "Measure the drawer before choosing an organizer." },
    { id, type: "heading", level: 2, text: "What to measure" },
    { id, type: "list", style: "bulleted", items: ["Width", "Depth"] },
    {
      id,
      type: "image",
      url: "https://images.example.com/drawer.webp",
      alt: "Organized kitchen drawer with divided utensils",
      caption: "Keep everyday tools visible.",
    },
    {
      id,
      type: "product",
      productId: "22222222-2222-4222-8222-222222222222",
      note: "A flexible option for mixed utensils.",
    },
    {
      id,
      type: "relatedArticle",
      articleId: "33333333-3333-4333-8333-333333333333",
      label: "Read the pantry guide",
    },
  ])("accepts the safe $type block", (block) => {
    expect(articleBlockSchema.safeParse(block).success).toBe(true);
  });

  it("rejects unknown blocks and arbitrary HTML blocks", () => {
    expect(
      articleBlockSchema.safeParse({
        id,
        type: "html",
        html: "<script>alert(1)</script>",
      }).success,
    ).toBe(false);
  });

  it("allows a titled draft with no content blocks", () => {
    expect(articleDraftSchema.safeParse({ title: "Kitchen drawer guide" }).success).toBe(true);
  });

  it("requires useful editorial and SEO fields before publication", () => {
    const result = articlePublishSchema.safeParse({
      title: "Kitchen drawer guide",
      slug: "kitchen-drawer-guide",
      excerpt: "A practical way to measure and organize a busy utensil drawer.",
      categoryId: "44444444-4444-4444-8444-444444444444",
      featuredImageUrl: "https://images.example.com/kitchen.webp",
      featuredImageAlt: "Bright kitchen with organized drawers",
      seoDescription: "Learn how to measure, divide, and organize a kitchen drawer.",
      content: [{ id, type: "paragraph", text: "Start by removing every item." }],
    });

    expect(result.success).toBe(true);
    expect(
      articlePublishSchema.safeParse({
        title: "Incomplete guide",
        content: [],
      }).success,
    ).toBe(false);
  });
});
