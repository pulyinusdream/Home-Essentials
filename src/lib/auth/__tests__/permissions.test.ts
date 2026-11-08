import { describe, expect, it } from "vitest";

import {
  ADMIN_PERMISSIONS,
  can,
  type Permission,
} from "@/lib/auth/permissions";

describe("admin permission matrix", () => {
  it("allows administrators to use every management capability", () => {
    for (const permission of ADMIN_PERMISSIONS) {
      expect(can("admin", permission)).toBe(true);
    }
  });

  it("allows editors to manage editorial content", () => {
    const editorialPermissions: Permission[] = [
      "dashboard.view",
      "products.manage",
      "categories.manage",
      "articles.manage",
      "navigation.manage",
      "settings.content.manage",
    ];

    for (const permission of editorialPermissions) {
      expect(can("editor", permission)).toBe(true);
    }
  });

  it("keeps sensitive administration capabilities away from editors", () => {
    const privilegedPermissions: Permission[] = [
      "media.manage",
      "affiliateLinks.manage",
      "analytics.view",
      "users.manage",
      "activityLogs.view",
      "settings.security.manage",
    ];

    for (const permission of privilegedPermissions) {
      expect(can("editor", permission)).toBe(false);
    }
  });
});
