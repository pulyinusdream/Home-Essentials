import type { Metadata } from "next";

export function buildEditorialMetadata({
  title,
  seoTitle,
  description,
  canonicalPath,
  imageUrl,
  imageAlt,
  type,
}: {
  title: string;
  seoTitle?: string | null;
  description: string;
  canonicalPath: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  type: "product" | "article";
}): Metadata {
  const resolvedTitle = seoTitle?.trim() || title;
  const image = secureImage(imageUrl, imageAlt);

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: type === "article" ? "article" : "website",
      title: resolvedTitle,
      description,
      url: canonicalPath,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}

function secureImage(url?: string | null, alt?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return { url, alt: alt?.trim() || "" };
  } catch {
    return null;
  }
}
