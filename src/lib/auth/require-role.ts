import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow, StaffRole } from "@/types/database.types";

const STAFF_ROLES: readonly StaffRole[] = ["admin", "editor"];

export type StaffSession = {
  user: {
    id: string;
    email: string | null;
  };
  profile: Pick<ProfileRow, "id" | "email" | "full_name" | "avatar_url" | "role">;
};

export async function requireStaff(
  allowedRoles: readonly StaffRole[] = STAFF_ROLES,
): Promise<StaffSession> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !allowedRoles.includes(profile.role)) {
    redirect("/admin/access-denied");
  }

  return { user, profile };
}
