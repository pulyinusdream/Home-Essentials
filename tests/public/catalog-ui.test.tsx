import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductCard } from "../../src/components/public/product-card";
import type { PublicProductCard } from "../../src/services/public/repository";

const product = {
  id: "product-1",
  name: "Adjustable overbed table",
  slug: "adjustable-overbed-table",
  brand: "Vaunn",
  short_description: "A rolling table for beds, couches, and wheelchairs.",
  main_image_url: "https://images.example.com/overbed-table.jpg",
  main_image_alt: "Black adjustable overbed table with wheels",
  display_price: null,
  currency: "USD",
  price_source: "none",
  price_verified_at: null,
  is_featured: true,
  category: {
    name: "Bedroom Essentials",
    slug: "bedroom-essentials",
  },
} satisfies PublicProductCard;

describe("public catalog cards", () => {
  it("gives a product specimen one clear destination and compliant action", () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />);

    expect(html).toContain('href="/products/adjustable-overbed-table"');
    expect(html).toContain("Bedroom Essentials");
    expect(html).toContain("Adjustable overbed table");
    expect(html).toContain("View recommendation");
    expect(html).toContain("View product details");
    expect(html).toContain(
      'aria-label="Black adjustable overbed table with wheels"',
    );
  });
});
