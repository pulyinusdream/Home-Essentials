import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { logoutAction } from "@/app/admin/login/actions";
import { Brand } from "@/components/shared/brand";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return (
    <main className="access-denied-page">
      <div className="access-denied-card">
        <Brand />
        <ShieldX aria-hidden="true" />
        <p className="eyebrow">Access denied</p>
        <h1>This account is not approved for administration.</h1>
        <p>
          Ask an administrator to create a staff profile for this account. No
          role can be assigned from the browser.
        </p>
        <div className="access-denied-actions">
          <form action={logoutAction}>
            <button className="button button--primary" type="submit">
              Sign out
            </button>
          </form>
          <Link className="text-link" href="/">
            Return to website
          </Link>
        </div>
      </div>
    </main>
  );
}
