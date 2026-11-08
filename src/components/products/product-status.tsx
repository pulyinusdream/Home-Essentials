import type { PublicationStatus } from "@/types/database.types";

const LABELS: Record<PublicationStatus, string> = {
  draft: "Draft",
  pending_review: "In review",
  published: "Published",
  archived: "Archived",
};

export function ProductStatus({ status }: { status: PublicationStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
