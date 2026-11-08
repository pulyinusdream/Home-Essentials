import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("public publication contract", () => {
  it.each([
    "src/app/page.tsx",
    "src/app/products/page.tsx",
    "src/app/products/[slug]/page.tsx",
    "src/app/categories/page.tsx",
    "src/app/categories/[slug]/page.tsx",
    "src/app/guides/page.tsx",
    "src/app/guides/[slug]/page.tsx",
    "src/app/affiliate-disclosure/page.tsx",
    "src/app/privacy-policy/page.tsx",
  ])("includes the public route %s", (path) => {
    expect(() => source(path)).not.toThrow();
  });

  it("renders the verified Special Link directly without a cloaking redirect", () => {
    const productPage = source("src/app/products/[slug]/page.tsx");
    const publicRepository = source("src/services/public/repository.ts");

    expect(productPage).toContain("href={product.affiliateUrl}");
    expect(productPage).not.toContain("/go/");
    expect(publicRepository).toContain('.from("affiliate_links")');
  });

  it("renders guides from validated blocks without arbitrary HTML", () => {
    const renderer = source("src/components/articles/article-renderer.tsx");
    expect(renderer).not.toContain("dangerouslySetInnerHTML");
    expect(renderer).toContain('block.type === "product"');
  });

  it("places the required Amazon disclosure in the shared public footer", () => {
    expect(source("src/components/public/public-footer.tsx")).toContain(
      "As an Amazon Associate I earn from qualifying purchases.",
    );
  });
});
