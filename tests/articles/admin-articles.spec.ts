import { describe, expect, it } from "vitest";

import {
  createDuplicateArticleValues,
  moveArticleBlock,
  referencedProductIds,
  validateReferencedProducts,
} from "@/services/articles/workflow";
import type { ArticleBlock } from "@/lib/validation/article";

const blocks: ArticleBlock[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    type: "paragraph",
    text: "Opening paragraph",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    type: "product",
    productId: "33333333-3333-4333-8333-333333333333",
    note: "Recommended product",
  },
];

describe("buying guide workflow", () => {
  it("moves blocks without losing their content", () => {
    const moved = moveArticleBlock(
      blocks,
      "22222222-2222-4222-8222-222222222222",
      "up",
    );
    expect(moved.map((block) => block.id)).toEqual([
      "22222222-2222-4222-8222-222222222222",
      "11111111-1111-4111-8111-111111111111",
    ]);
  });

  it("extracts unique product recommendations in editorial order", () => {
    expect(referencedProductIds([...blocks, blocks[1]])).toEqual([
      "33333333-3333-4333-8333-333333333333",
    ]);
  });

  it("rejects product blocks that reference unavailable products", () => {
    expect(validateReferencedProducts(blocks, new Set())).toEqual([
      "33333333-3333-4333-8333-333333333333",
    ]);
  });

  it("duplicates a guide as an unpublished draft", () => {
    expect(
      createDuplicateArticleValues(
        {
          title: "Kitchen Drawer Guide",
          slug: "kitchen-drawer-guide",
          status: "published",
          published_at: "2026-11-08T00:00:00.000Z",
        },
        "copy-123",
      ),
    ).toEqual({
      title: "Kitchen Drawer Guide (Copy)",
      slug: "kitchen-drawer-guide-copy-123",
      status: "draft",
      published_at: null,
    });
  });
});
