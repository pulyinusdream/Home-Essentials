import type { StaffRole } from "@/types/database.types";

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "products.manage",
  "categories.manage",
  "articles.manage",
  "navigation.manage",
  "settings.content.manage",
  "media.manage",
  "affiliateLinks.manage",
  "analytics.view",
  "users.manage",
  "activityLogs.view",
  "settings.security.manage",
] as const;

export type Permission = (typeof ADMIN_PERMISSIONS)[number];

const EDITOR_PERMISSIONS = new Set<Permission>([
  "dashboard.view",
  "products.manage",
  "categories.manage",
  "articles.manage",
  "navigation.manage",
  "settings.content.manage",
]);

export function can(role: StaffRole, permission: Permission): boolean {
  return role === "admin" || EDITOR_PERMISSIONS.has(permission);
}
