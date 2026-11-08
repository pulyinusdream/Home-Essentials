import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu } from "lucide-react";

import { logoutAction } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Brand } from "@/components/shared/brand";
import type { StaffSession } from "@/lib/auth/require-role";

export function AdminShell({
  session,
  children,
}: {
  session: StaffSession;
  children: ReactNode;
}) {
  const displayName = session.profile.full_name?.trim() || session.profile.email;

  return (
    <div className="admin-canvas">
      <div className="admin-frame">
        <aside className="admin-sidebar">
          <Brand admin />
          <div className="admin-sidebar__section-label">Publishing studio</div>
          <AdminNav role={session.profile.role} />
          <div className="admin-sidebar__footer">
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" />
              View website
            </Link>
            <form action={logoutAction}>
              <button type="submit">
                <LogOut aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-workspace">
          <header className="admin-topbar">
            <details className="admin-mobile-menu">
              <summary aria-label="Open administration navigation">
                <Menu aria-hidden="true" />
                Menu
              </summary>
              <div className="admin-mobile-menu__panel">
                <AdminNav role={session.profile.role} />
              </div>
            </details>
            <div className="admin-identity">
              <span>{displayName}</span>
              <span>{session.profile.role}</span>
            </div>
          </header>
          <main className="admin-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
