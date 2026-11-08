import { describe, expect, it } from "vitest";

import { buildEditorialMetadata } from "@/lib/seo/metadata";

describe("editorial metadata", () => {
  it("uses editorial overrides and a canonical public path", () => {
    const metadata = buildEditorialMetadata({
      title: "Drawer organizer recommendation",
      seoTitle: "Best drawer organizer for small kitchens",
      description: "A practical recommendation for calmer kitchen drawers.",
      canonicalPath: "/products/drawer-organizer",
      imageUrl: "https://example.com/organizer.jpg",
      imageAlt: "Expandable organizer in a kitchen drawer",
      type: "product",
    });

    expect(metadata.title).toBe("Best drawer organizer for small kitchens");
    expect(metadata.alternates).toEqual({ canonical: "/products/drawer-organizer" });
    expect(metadata.openGraph).toMatchObject({ type: "website", url: "/products/drawer-organizer" });
    expect(metadata.openGraph && "images" in metadata.openGraph ? metadata.openGraph.images : []).toEqual([
      { url: "https://example.com/organizer.jpg", alt: "Expandable organizer in a kitchen drawer" },
    ]);
  });

  it("omits an invalid image URL instead of emitting broken metadata", () => {
    const metadata = buildEditorialMetadata({
      title: "Kitchen guide",
      description: "Useful kitchen ideas.",
      canonicalPath: "/guides/kitchen-guide",
      imageUrl: "javascript:alert(1)",
      imageAlt: "Kitchen",
      type: "article",
    });

    expect(metadata.openGraph && "images" in metadata.openGraph ? metadata.openGraph.images : undefined).toBeUndefined();
  });
});
