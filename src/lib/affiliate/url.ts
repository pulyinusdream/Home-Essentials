export type AffiliateUrlResult =
  | {
      valid: true;
      url: string;
      hostname: string;
      asin: string;
      trackingId: string | null;
    }
  | { valid: false; reason: string };

export type AffiliateUrlOptions = {
  expectedAsin?: string | null;
  requireTrackingId?: boolean;
};

const ASIN_PATH_PATTERN =
  /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/asin)\/([a-z0-9]{10})(?:[/?]|$)/i;

export function validateAmazonUrl(
  input: string,
  options: AffiliateUrlOptions = {},
): AffiliateUrlResult {
  const exactUrl = input.trim();
  let parsed: URL;

  try {
    parsed = new URL(exactUrl);
  } catch {
    return { valid: false, reason: "Enter a complete Amazon.com URL." };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, reason: "Amazon links must use HTTPS." };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "amazon.com" && !hostname.endsWith(".amazon.com")) {
    return {
      valid: false,
      reason: "Only Amazon.com destinations for US shoppers are allowed.",
    };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: "Amazon links cannot contain credentials." };
  }

  if (parsed.port) {
    return { valid: false, reason: "Amazon links cannot use a custom port." };
  }

  const match = parsed.pathname.match(ASIN_PATH_PATTERN);
  if (!match) {
    return {
      valid: false,
      reason: "Use a direct Amazon product link containing its ASIN.",
    };
  }

  const asin = match[1].toUpperCase();
  const expectedAsin = options.expectedAsin?.trim().toUpperCase();
  if (expectedAsin && asin !== expectedAsin) {
    return {
      valid: false,
      reason: "The Amazon link ASIN does not match this product.",
    };
  }

  const trackingId = parsed.searchParams.get("tag")?.trim() || null;
  if (options.requireTrackingId && !trackingId) {
    return {
      valid: false,
      reason: "The Amazon link must include an Associates tracking ID.",
    };
  }

  return { valid: true, url: exactUrl, hostname, asin, trackingId };
}
