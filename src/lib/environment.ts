export type PublicEnvironment =
  | { configured: false; missing: string[] }
  | { configured: true; supabaseUrl: string; supabaseAnonKey: string };

export function parsePublicEnvironment(
  environment: Record<string, string | undefined>,
): PublicEnvironment {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const missing = required.filter((key) => !environment[key]?.trim());

  if (missing.length > 0) {
    return { configured: false, missing: [...missing] };
  }

  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const supabaseAnonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:") {
      return { configured: false, missing: ["NEXT_PUBLIC_SUPABASE_URL"] };
    }
  } catch {
    return { configured: false, missing: ["NEXT_PUBLIC_SUPABASE_URL"] };
  }

  return { configured: true, supabaseUrl, supabaseAnonKey };
}

export function getPublicEnvironment(): PublicEnvironment {
  return parsePublicEnvironment({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
