import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("platform security boundaries", () => {
  it("does not require a service-role credential in application source", () => {
    const clientFiles = collect(join(root, "src"))
      .filter((path) => /\.(ts|tsx)$/.test(path))
      .filter((path) => readFileSync(path, "utf8").startsWith('"use client"'));

    for (const path of clientFiles) {
      expect(readFileSync(path, "utf8"), path).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
    expect(source(".env.example")).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("exposes direct links only through a narrow publication-aware policy", () => {
    const publicLinks = source("supabase/migrations/006_public_affiliate_links.sql");
    expect(publicLinks).toContain("grant select on table public.affiliate_links to anon");
    expect(publicLinks).toContain("status = 'active'");
    expect(publicLinks).toContain("last_verified_at is not null");
    expect(publicLinks).toContain("products.status = 'published'");
    expect(publicLinks).toContain("categories.is_active = true");
  });

  it("keeps unpublished content behind database visibility policies", () => {
    const policies = source("supabase/migrations/002_rls_policies.sql");
    expect(policies).toContain("products_public_read");
    expect(policies).toContain("articles_public_read");
    expect(policies).toMatch(/status = 'published'/);
    expect(policies).toMatch(/published_at <= now\(\)/);
  });
});

function collect(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? collect(path) : [path];
  });
}
