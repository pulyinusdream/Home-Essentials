import type { PublicationStatus } from "@/types/database.types";

const PRICE_FRESHNESS_MS = 24 * 60 * 60 * 1000;

export function isPublishedAt(
  status: PublicationStatus | string,
  publishedAt: string | null,
  now = new Date(),
) {
  if (status !== "published" || !publishedAt) return false;
  const timestamp = Date.parse(publishedAt);
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

export function getCompliantPrice(
  record: {
    displayPrice: number | null;
    currency: string;
    priceSource: string;
    priceVerifiedAt: string | null;
  },
  now = new Date(),
) {
  if (
    record.priceSource !== "amazon_api" ||
    record.displayPrice === null ||
    record.displayPrice < 0 ||
    !record.priceVerifiedAt
  ) {
    return null;
  }

  const verifiedAt = Date.parse(record.priceVerifiedAt);
  const age = now.getTime() - verifiedAt;
  if (!Number.isFinite(verifiedAt) || age < 0 || age > PRICE_FRESHNESS_MS) {
    return null;
  }

  return { amount: record.displayPrice, currency: record.currency };
}
