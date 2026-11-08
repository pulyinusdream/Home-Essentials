import type { ArticleBlock } from "@/lib/validation/article";
import type { PublicationStatus } from "@/types/database.types";

export function moveArticleBlock(
  blocks: ArticleBlock[],
  blockId: string,
  direction: "up" | "down",
) {
  const currentIndex = blocks.findIndex((block) => block.id === blockId);
  if (currentIndex < 0) return blocks;
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= blocks.length) return blocks;

  const reordered = [...blocks];
  [reordered[currentIndex], reordered[nextIndex]] = [
    reordered[nextIndex],
    reordered[currentIndex],
  ];
  return reordered;
}

export function referencedProductIds(blocks: ArticleBlock[]) {
  return [
    ...new Set(
      blocks.flatMap((block) =>
        block.type === "product" ? [block.productId] : [],
      ),
    ),
  ];
}

export function validateReferencedProducts(
  blocks: ArticleBlock[],
  availableProductIds: ReadonlySet<string>,
) {
  return referencedProductIds(blocks).filter(
    (productId) => !availableProductIds.has(productId),
  );
}

export function createDuplicateArticleValues(
  source: {
    title: string;
    slug: string;
    status: PublicationStatus;
    published_at: string | null;
  },
  suffix: string,
) {
  return {
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-${suffix}`,
    status: "draft" as const,
    published_at: null,
  };
}
