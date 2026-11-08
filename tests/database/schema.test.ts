import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = (name: string) =>
  readFileSync(resolve("supabase/migrations", name), "utf8").toLowerCase();

const schema = migration("001_initial_schema.sql");
const policies = migration("002_rls_policies.sql");
const storage = migration("003_storage_setup.sql");
const functions = migration("004_functions_and_triggers.sql");
const indexes = migration("005_indexes.sql");
const seed = readFileSync(resolve("supabase/seed.sql"), "utf8").toLowerCase();

const applicationTables = [
  "profiles",
  "categories",
  "products",
  "product_images",
  "tags",
  "product_tags",
  "articles",
  "article_products",
  "affiliate_links",
  "product_clicks",
  "site_settings",
  "navigation_items",
  "activity_logs",
  "media_assets",
] as const;

describe("Supabase database contract", () => {
  it("creates every required relational table", () => {
    for (const table of applicationTables) {
      expect(schema).toMatch(new RegExp(`create table(?: if not exists)? public\\.${table}\\b`));
    }
  });

  it("enables RLS and revokes broad grants for every application table", () => {
    for (const table of applicationTables) {
      expect(policies).toContain(`alter table public.${table} enable row level security`);
      expect(policies).toContain(`revoke all on table public.${table} from anon, authenticated`);
    }
  });

  it("defines database-backed staff roles without trusting user metadata", () => {
    expect(policies).toContain("create or replace function private.has_role");
    expect(policies).toContain("from public.profiles");
    expect(policies).not.toContain("raw_user_meta_data");
    expect(policies).not.toContain("user_metadata");
  });

  it("keeps affiliate links and activity logs out of anonymous reads", () => {
    expect(policies).not.toMatch(/grant select on table public\.affiliate_links to anon/);
    expect(policies).not.toMatch(/grant select on table public\.activity_logs to anon/);
    expect(policies).not.toMatch(/grant insert on table public\.product_clicks to anon/);
  });

  it("configures public media with administrator-only writes", () => {
    expect(storage).toContain("public-media");
    expect(storage).toContain("5242880");
    expect(storage).toContain("private.has_role(array['admin'])");
    expect(storage).not.toContain("private.has_role(array['admin', 'editor'])");
    expect(storage).toContain("for insert");
    expect(storage).toContain("for delete");
  });

  it("keeps analytics and media metadata administrator-only", () => {
    const analyticsPolicy = policies.match(
      /create policy product_clicks_staff_read[\s\S]*?;/,
    )?.[0];
    const mediaPolicy = policies.match(
      /create policy media_assets_staff_all[\s\S]*?;/,
    )?.[0];

    expect(analyticsPolicy).toContain("private.has_role(array['admin'])");
    expect(analyticsPolicy).not.toContain("editor");
    expect(mediaPolicy).toContain("private.has_role(array['admin'])");
    expect(mediaPolicy).not.toContain("editor");
  });

  it("installs update, audit, and publication-readiness safeguards", () => {
    expect(functions).toContain("create or replace function public.set_updated_at");
    expect(functions).toContain("create or replace function private.audit_content_change");
    expect(functions).toContain("create or replace function private.enforce_product_publish_readiness");
    expect(functions).toContain("create trigger products_publish_readiness");
  });

  it("indexes publication, slug, relationship, and analytics query paths", () => {
    for (const fragment of [
      "products_status_published_at_idx",
      "products_category_status_idx",
      "articles_status_published_at_idx",
      "product_clicks_clicked_at_idx",
      "affiliate_links_active_product_idx",
    ]) {
      expect(indexes).toContain(fragment);
    }
  });

  it("seeds exactly the seven requested categories and no fake products", () => {
    const names = [
      "kitchen essentials",
      "bedroom essentials",
      "bathroom essentials",
      "home organization",
      "cleaning essentials",
      "living room",
      "smart home",
    ];
    for (const name of names) expect(seed).toContain(name);
    expect(seed).not.toMatch(/insert\s+into\s+public\.products/);
    expect((seed.match(/gen_random_uuid\(\)/g) ?? []).length).toBe(7);
  });
});
