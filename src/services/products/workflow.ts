import type { PublicationStatus } from "@/types/database.types";

const STATUSES = new Set<PublicationStatus>([
  "draft",
  "pending_review",
  "published",
  "archived",
]);

export type ProductListFilters = {
  search: string;
  status: PublicationStatus | "all";
  category: string;
  page: number;
  perPage: number;
};

export function normalizeProductListFilters(input: {
  search?: string;
  status?: string;
  category?: string;
  page?: string | number;
  perPage?: string | number;
}): ProductListFilters {
  const parsedPage = Number.parseInt(String(input.page ?? "1"), 10);
  const parsedPerPage = Number.parseInt(String(input.perPage ?? "20"), 10);
  const candidateStatus = input.status?.trim() as PublicationStatus | undefined;

  return {
    search: input.search?.trim().slice(0, 120) ?? "",
    status:
      candidateStatus && STATUSES.has(candidateStatus)
        ? candidateStatus
        : "all",
    category: input.category?.trim().slice(0, 120) ?? "",
    page: Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1,
    perPage: Number.isFinite(parsedPerPage)
      ? Math.min(50, Math.max(1, parsedPerPage))
      : 20,
  };
}

const TRANSITIONS: Record<PublicationStatus, ReadonlySet<PublicationStatus>> = {
  draft: new Set(["draft", "pending_review", "published", "archived"]),
  pending_review: new Set(["draft", "pending_review", "published", "archived"]),
  published: new Set(["draft", "published", "archived"]),
  archived: new Set(["draft", "archived"]),
};

export function canTransitionProductStatus(
  current: PublicationStatus,
  next: PublicationStatus,
) {
  return TRANSITIONS[current].has(next);
}

export function canDeleteProduct(status: PublicationStatus) {
  return status === "draft" || status === "archived";
}

export function createDuplicateProductValues(
  source: {
    name: string;
    slug: string;
    status: PublicationStatus;
    published_at: string | null;
    is_featured: boolean;
    homepage_placement: number | null;
  },
  suffix: string,
) {
  return {
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-${suffix}`,
    status: "draft" as const,
    published_at: null,
    is_featured: false,
    homepage_placement: null,
  };
}
