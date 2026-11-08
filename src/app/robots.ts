import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

function absoluteUrl(path: string) {
  try { return new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").toString(); }
  catch { return `http://127.0.0.1:3000${path}`; }
}
