import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Home Essentials",
    short_name: "Home Essentials",
    description: "Thoughtful home finds and practical buying guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#252525",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
