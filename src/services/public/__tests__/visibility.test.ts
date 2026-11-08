import { describe, expect, it } from "vitest";

import {
  getCompliantPrice,
  isPublishedAt,
} from "@/services/public/visibility";

const now = new Date("2026-11-08T12:00:00.000Z");

describe("public publication visibility", () => {
  it("shows only content that is published no later than now", () => {
    expect(isPublishedAt("published", "2026-11-08T11:00:00.000Z", now)).toBe(true);
    expect(isPublishedAt("draft", "2026-11-08T11:00:00.000Z", now)).toBe(false);
    expect(isPublishedAt("published", "2026-11-09T11:00:00.000Z", now)).toBe(false);
    expect(isPublishedAt("published", null, now)).toBe(false);
  });

  it("returns only fresh Amazon API price data", () => {
    expect(
      getCompliantPrice(
        {
          displayPrice: 39.99,
          currency: "USD",
          priceSource: "amazon_api",
          priceVerifiedAt: "2026-11-08T02:00:00.000Z",
        },
        now,
      ),
    ).toEqual({ amount: 39.99, currency: "USD" });
  });

  it.each([
    { displayPrice: 39.99, currency: "USD", priceSource: "none", priceVerifiedAt: "2026-11-08T02:00:00.000Z" },
    { displayPrice: null, currency: "USD", priceSource: "amazon_api", priceVerifiedAt: "2026-11-08T02:00:00.000Z" },
    { displayPrice: 39.99, currency: "USD", priceSource: "amazon_api", priceVerifiedAt: null },
    { displayPrice: 39.99, currency: "USD", priceSource: "amazon_api", priceVerifiedAt: "2026-11-07T11:59:59.000Z" },
  ])("hides noncompliant or stale prices", (record) => {
    expect(getCompliantPrice(record, now)).toBeNull();
  });
});
