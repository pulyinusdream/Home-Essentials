import { expect, test } from "vitest";

import { parsePublicEnvironment } from "../src/lib/environment";

test("returns a setup-safe result when public Supabase values are missing", () => {
  const result = parsePublicEnvironment({});

  expect(result).toEqual({
    configured: false,
    missing: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
  });
});

test("returns only public values when Supabase configuration is valid", () => {
  const result = parsePublicEnvironment({
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-value",
    SUPABASE_SERVICE_ROLE_KEY: "must-not-leak",
  });

  expect(result).toEqual({
    configured: true,
    supabaseUrl: "https://project.supabase.co",
    supabaseAnonKey: "public-publishable-value",
  });
  expect(JSON.stringify(result)).not.toContain("must-not-leak");
});

test("treats malformed and insecure Supabase URLs as unconfigured", () => {
  for (const value of ["not-a-url", "http://project.supabase.co"]) {
    const result = parsePublicEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: value,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-publishable-value",
    });

    expect(result.configured).toBe(false);
  }
});

test("accepts the legacy anon variable during a staged migration", () => {
  expect(
    parsePublicEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-value",
    }),
  ).toMatchObject({ configured: true, supabaseAnonKey: "legacy-anon-value" });
});
