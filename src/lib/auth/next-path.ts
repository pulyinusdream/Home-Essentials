const DEFAULT_ADMIN_PATH = "/admin";

export function sanitizeAdminNextPath(candidate?: string | null): string {
  if (!candidate?.startsWith("/admin")) return DEFAULT_ADMIN_PATH;
  if (candidate.startsWith("//")) return DEFAULT_ADMIN_PATH;

  try {
    const parsed = new URL(candidate, "https://home-essentials.invalid");
    if (parsed.origin !== "https://home-essentials.invalid") {
      return DEFAULT_ADMIN_PATH;
    }
    if (parsed.pathname !== "/admin" && !parsed.pathname.startsWith("/admin/")) {
      return DEFAULT_ADMIN_PATH;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_ADMIN_PATH;
  }
}
