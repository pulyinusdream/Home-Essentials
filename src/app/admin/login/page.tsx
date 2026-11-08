import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/app/admin/login/login-form";
import { Brand } from "@/components/shared/brand";
import { sanitizeAdminNextPath } from "@/lib/auth/next-path";
import { getPublicEnvironment } from "@/lib/environment";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configuration = getPublicEnvironment();
  const nextPath = sanitizeAdminNextPath(next);

  return (
    <main className="admin-login-page">
      <section className="admin-login-frame" aria-labelledby="admin-login-title">
        <div className="admin-login-intro">
          <Brand />
          <div>
            <p className="eyebrow">Private publishing studio</p>
            <h1 id="admin-login-title">Manage every useful recommendation.</h1>
            <p>
              Products, buying guides, affiliate links, and publication status
              stay together in one secure editorial workspace.
            </p>
          </div>
          <div className="admin-login-assurance">
            <ShieldCheck aria-hidden="true" />
            <p>Access is limited to approved Home Essentials staff accounts.</p>
          </div>
        </div>

        <div className="admin-login-panel">
          <Link className="admin-back-link" href="/">
            <ArrowLeft aria-hidden="true" />
            Return to website
          </Link>
          <div className="admin-login-panel__heading">
            <p className="eyebrow">Administration</p>
            <h2>Welcome back</h2>
            <p>Use the account created in your Supabase project.</p>
          </div>

          {configuration.configured ? (
            <LoginForm nextPath={nextPath} />
          ) : (
            <div className="configuration-notice" role="status">
              <Database aria-hidden="true" />
              <div>
                <h3>Connect Supabase first</h3>
                <p>
                  Add the hosted Supabase URL and public anon key to
                  <code>.env.local</code>. The login form will appear after the
                  app restarts.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
