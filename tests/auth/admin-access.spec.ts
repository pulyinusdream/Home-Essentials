import { describe, expect, it } from "vitest";

import { sanitizeAdminNextPath } from "@/lib/auth/next-path";

describe("admin redirect safety", () => {
  it("preserves valid internal admin destinations", () => {
    expect(sanitizeAdminNextPath("/admin")).toBe("/admin");
    expect(sanitizeAdminNextPath("/admin/products?status=draft")).toBe(
      "/admin/products?status=draft",
    );
  });

  it.each([
    undefined,
    "",
    "/products",
    "//malicious.example/admin",
    "https://malicious.example/admin",
    "javascript:alert(1)",
  ])("falls back safely for %s", (candidate) => {
    expect(sanitizeAdminNextPath(candidate)).toBe("/admin");
  });
});
