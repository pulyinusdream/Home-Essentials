import { getPublicEnvironment } from "@/lib/environment";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase is not configured for this environment.");
    this.name = "SupabaseConfigurationError";
  }
}

export function requireSupabaseConfiguration() {
  const configuration = getPublicEnvironment();
  if (!configuration.configured) throw new SupabaseConfigurationError();
  return configuration;
}
