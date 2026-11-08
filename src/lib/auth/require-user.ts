import { redirect } from "next/navigation";

import { sanitizeAdminNextPath } from "@/lib/auth/next-path";
import { getPublicEnvironment } from "@/lib/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (!getPublicEnvironment().configured) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) return null;

  return {
    id: data.claims.sub,
    email:
      typeof data.claims.email === "string" ? data.claims.email : null,
  };
}

export async function requireUser(nextPath = "/admin") {
  if (!getPublicEnvironment().configured) {
    redirect("/admin/login?configuration=missing");
  }

  const user = await getAuthenticatedUser();
  if (user) return user;

  const safeNextPath = sanitizeAdminNextPath(nextPath);
  redirect(`/admin/login?next=${encodeURIComponent(safeNextPath)}`);
}
