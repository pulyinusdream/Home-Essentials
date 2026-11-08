import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireStaff();
  return <AdminShell session={session}>{children}</AdminShell>;
}
