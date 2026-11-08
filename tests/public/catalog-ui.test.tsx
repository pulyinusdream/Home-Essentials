import { readFileSync } from "node:fs";

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

const publicCss = readFileSync("src/app/public.css", "utf8");

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

describe("public design system contract", () => {
  it("keeps keyboard focus visible on the accent footer", () => {
    expect(publicCss).toMatch(
      /\.public-site \.public-footer :focus-visible\s*\{[^}]*outline-color:\s*var\(--public-accent-ink\)/s,
    );
  });

  it("gives navigation and text links a 44px minimum target", () => {
    expect(publicCss).toMatch(
      /\.public-site \.public-nav a,[\s\S]*?\.public-site \.text-link\s*\{[^}]*min-height:\s*44px;[^}]*display:\s*inline-flex;/,
    );
  });

  it("maps retained public headings onto the public typeface", () => {
    expect(publicCss).toContain(
      '--font-display: var(--font-public), "Segoe UI", sans-serif;',
    );
  });

  it("styles introduction copy independently from optional metadata", () => {
    expect(publicCss).toContain(
      ".public-site .public-page-hero > p:not(.public-page-meta)",
    );
    expect(publicCss).not.toContain(
      ".public-site .public-page-hero > p:last-child",
    );
  });
});
