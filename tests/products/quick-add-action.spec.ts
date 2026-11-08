import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireStaffMock } = vi.hoisted(() => ({
  requireStaffMock: vi.fn(),
}));

vi.mock("@/lib/auth/require-role", () => ({
  requireStaff: requireStaffMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => {
    throw new Error("Validation failures must not reach the database.");
  }),
}));

import { createQuickProductAction } from "@/services/products/mutations";

const CATEGORY_ID = "11111111-1111-4111-8111-111111111111";
const INITIAL_STATE = { status: "idle" as const, message: "", fieldErrors: {} };

function quickForm(overrides: Record<string, string> = {}) {
  const values = {
    name: "Vaunn Adjustable Overbed Table",
    categoryId: CATEGORY_ID,
    recommendation:
      "A practical rolling surface beside a bed, couch, or wheelchair.",
    mainImageUrl: "https://images.example.com/vaunn-overbed-table.webp",
    affiliateUrl:
      "https://www.amazon.com/Vaunn-Medical-Adjustable-Overbed-Hospital/dp/B0DWG1P145?tag=homeessen0e2b-20",
    affiliateConfirmed: "on",
    intent: "publish",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

function session(role: "admin" | "editor") {
  return {
    user: { id: "00000000-0000-4000-8000-000000000001", email: "owner@example.com" },
    profile: {
      id: "00000000-0000-4000-8000-000000000001",
      full_name: "Owner",
      email: "owner@example.com",
      avatar_url: null,
      role,
    },
  };
}

describe("quick product action", () => {
  beforeEach(() => {
    requireStaffMock.mockReset();
    requireStaffMock.mockResolvedValue(session("admin"));
  });

  it("maps generated description errors back to the visible recommendation", async () => {
    const result = await createQuickProductAction(
      INITIAL_STATE,
      quickForm({ recommendation: "" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.recommendation).toBeDefined();
    expect(result.fieldErrors).not.toHaveProperty("shortDescription");
    expect(result.fieldErrors).not.toHaveProperty("description");
    expect(result.fieldErrors).not.toHaveProperty("seoDescription");
  });

  it("keeps affiliate-link management unavailable to editors", async () => {
    requireStaffMock.mockResolvedValue(session("editor"));

    const result = await createQuickProductAction(
      INITIAL_STATE,
      quickForm({ intent: "draft" }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Only an administrator can add or verify affiliate links.",
      fieldErrors: {
        affiliateUrl: ["Only an administrator can add or verify affiliate links."],
      },
    });
  });

  it("shows a visible affiliate error when the tracking ID is missing", async () => {
    const result = await createQuickProductAction(
      INITIAL_STATE,
      quickForm({
        affiliateUrl:
          "https://www.amazon.com/Vaunn-Medical-Adjustable-Overbed-Hospital/dp/B0DWG1P145",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.affiliateUrl).toContain(
      "The Amazon link must include an Associates tracking ID.",
    );
    expect(result.fieldErrors).not.toHaveProperty("asin");
  });
});
