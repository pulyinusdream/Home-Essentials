"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChartNoAxesCombined,
  CircleGauge,
  Images,
  Link2,
  ListTree,
  PackageSearch,
  ScrollText,
  Settings2,
  Shapes,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { can, type Permission } from "@/lib/auth/permissions";
import type { StaffRole } from "@/types/database.types";

type AdminNavigationItem = {
  href: string;
  label: string;
  permission: Permission;
  icon: LucideIcon;
};

const NAVIGATION: AdminNavigationItem[] = [
  { href: "/admin", label: "Overview", permission: "dashboard.view", icon: CircleGauge },
  { href: "/admin/products", label: "Products", permission: "products.manage", icon: PackageSearch },
  { href: "/admin/articles", label: "Buying guides", permission: "articles.manage", icon: BookOpenText },
  { href: "/admin/categories", label: "Categories", permission: "categories.manage", icon: Shapes },
  { href: "/admin/media", label: "Media", permission: "media.manage", icon: Images },
  { href: "/admin/affiliate-links", label: "Affiliate links", permission: "affiliateLinks.manage", icon: Link2 },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics.view", icon: ChartNoAxesCombined },
  { href: "/admin/navigation", label: "Navigation", permission: "navigation.manage", icon: ListTree },
  { href: "/admin/site-settings", label: "Site settings", permission: "settings.content.manage", icon: Settings2 },
  { href: "/admin/users", label: "Users", permission: "users.manage", icon: UsersRound },
  { href: "/admin/activity-logs", label: "Activity logs", permission: "activityLogs.view", icon: ScrollText },
];

export function AdminNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Administration">
      {NAVIGATION.filter((item) => can(role, item.permission)).map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "admin-nav__link is-active" : "admin-nav__link"}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
