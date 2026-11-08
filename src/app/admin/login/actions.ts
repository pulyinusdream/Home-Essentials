"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { sanitizeAdminNextPath } from "@/lib/auth/next-path";
import { getPublicEnvironment } from "@/lib/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LoginActionState } from "@/app/admin/login/login-state";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function loginAction(
  previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  void previousState;

  if (!getPublicEnvironment().configured) {
    return {
      status: "error",
      message: "Supabase is not configured for this environment.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email address and password.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "The email or password is incorrect.",
    };
  }

  redirect(sanitizeAdminNextPath(parsed.data.next));
}

export async function logoutAction() {
  if (getPublicEnvironment().configured) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
