import { describe, expect, it } from "vitest";

import {
  canDeleteProduct,
  canTransitionProductStatus,
  createDuplicateProductValues,
  normalizeProductListFilters,
} from "@/services/products/workflow";
import { productFormDataToInput } from "@/services/products/form-data";

describe("product administration workflow", () => {
  it("normalizes search, status, category, and pagination inputs", () => {
    expect(
      normalizeProductListFilters({
        search: "  bamboo organizer  ",
        status: "published",
        category: "  kitchen-essentials ",
        page: "0",
        perPage: "500",
      }),
    ).toEqual({
      search: "bamboo organizer",
      status: "published",
      category: "kitchen-essentials",
      page: 1,
      perPage: 50,
    });
  });

  it("drops unsupported status filters instead of forwarding them", () => {
    expect(normalizeProductListFilters({ status: "deleted" }).status).toBe(
      "all",
    );
  });

  it("allows only explicit publication-state transitions", () => {
    expect(canTransitionProductStatus("draft", "published")).toBe(true);
    expect(canTransitionProductStatus("published", "draft")).toBe(true);
    expect(canTransitionProductStatus("archived", "published")).toBe(false);
    expect(canTransitionProductStatus("published", "pending_review")).toBe(
      false,
    );
  });

  it("duplicates into a fresh draft without publication timestamps", () => {
    expect(
      createDuplicateProductValues(
        {
          name: "Drawer Organizer",
          slug: "drawer-organizer",
          status: "published",
          published_at: "2026-11-08T00:00:00.000Z",
          is_featured: true,
          homepage_placement: 1,
        },
        "copy-123",
      ),
    ).toEqual({
      name: "Drawer Organizer (Copy)",
      slug: "drawer-organizer-copy-123",
      status: "draft",
      published_at: null,
      is_featured: false,
      homepage_placement: null,
    });
  });

  it("requires products to be draft or archived before permanent deletion", () => {
    expect(canDeleteProduct("draft")).toBe(true);
    expect(canDeleteProduct("archived")).toBe(true);
    expect(canDeleteProduct("pending_review")).toBe(false);
    expect(canDeleteProduct("published")).toBe(false);
  });

  it("ignores client-supplied price claims and pairs structured specifications", () => {
    const formData = new FormData();
    formData.set("name", "Bamboo Drawer Organizer");
    formData.set("priceSource", "amazon_api");
    formData.set("displayPrice", "29.99");
    formData.append("specificationName", "Material");
    formData.append("specificationValue", "Bamboo");

    const input = productFormDataToInput(formData);

    expect(input.slug).toBe("bamboo-drawer-organizer");
    expect(input.priceSource).toBe("none");
    expect(input.displayPrice).toBeNull();
    expect(input.specifications).toEqual([
      { name: "Material", value: "Bamboo" },
    ]);
  });
});
