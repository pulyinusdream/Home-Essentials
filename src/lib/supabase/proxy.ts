import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnvironment } from "@/lib/environment";
import { sanitizeAdminNextPath } from "@/lib/auth/next-path";
import type { Database } from "@/types/database.types";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/access-denied"]);

export async function updateSupabaseSession(request: NextRequest) {
  const configuration = getPublicEnvironment();
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.has(pathname);

  if (!configuration.configured) {
    if (isPublicAdminPath) return response;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("configuration", "missing");
    loginUrl.searchParams.set(
      "next",
      sanitizeAdminNextPath(`${pathname}${request.nextUrl.search}`),
    );
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient<Database>(
    configuration.supabaseUrl,
    configuration.supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      sanitizeAdminNextPath(`${pathname}${request.nextUrl.search}`),
    );
    return copyResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  if (data?.claims && pathname === "/admin/login") {
    const destination = sanitizeAdminNextPath(
      request.nextUrl.searchParams.get("next"),
    );
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = destination.split("?")[0];
    adminUrl.search = destination.includes("?")
      ? `?${destination.split("?").slice(1).join("?")}`
      : "";
    return copyResponseCookies(response, NextResponse.redirect(adminUrl));
  }

  return response;
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}
