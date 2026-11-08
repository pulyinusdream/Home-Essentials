import { describe, expect, it } from "vitest";

import { validateAmazonUrl } from "@/lib/affiliate/url";

const verifiedUrl =
  "https://www.amazon.com/dp/B0ABC12345?tag=homeessential-20&ref_=as_li_ss_tl";

describe("Amazon.com affiliate URL validation", () => {
  it("preserves the exact verified destination", () => {
    const result = validateAmazonUrl(verifiedUrl, {
      expectedAsin: "B0ABC12345",
      requireTrackingId: true,
    });

    expect(result).toEqual({
      valid: true,
      url: verifiedUrl,
      hostname: "www.amazon.com",
      asin: "B0ABC12345",
      trackingId: "homeessential-20",
    });
  });

  it.each([
    "http://www.amazon.com/dp/B0ABC12345?tag=homeessential-20",
    "https://amazon.com.evil.example/dp/B0ABC12345?tag=homeessential-20",
    "https://evilamazon.com/dp/B0ABC12345?tag=homeessential-20",
    "https://user:password@amazon.com/dp/B0ABC12345?tag=homeessential-20",
    "https://amazon.com:444/dp/B0ABC12345?tag=homeessential-20",
    "https://amazon.com/s?k=storage&tag=homeessential-20",
  ])("rejects unsafe or non-product destination %s", (url) => {
    expect(validateAmazonUrl(url).valid).toBe(false);
  });

  it("rejects an ASIN that does not match the product record", () => {
    const result = validateAmazonUrl(verifiedUrl, {
      expectedAsin: "B099999999",
    });

    expect(result).toEqual({
      valid: false,
      reason: "The Amazon link ASIN does not match this product.",
    });
  });

  it("can require an Associates tracking ID before publication", () => {
    const result = validateAmazonUrl("https://www.amazon.com/dp/B0ABC12345", {
      requireTrackingId: true,
    });

    expect(result).toEqual({
      valid: false,
      reason: "The Amazon link must include an Associates tracking ID.",
    });
  });
});
