"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseConfiguration } from "@/lib/supabase/configuration";
import type { Database } from "@/types/database.types";

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfiguration();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
