import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only, NEVER import from client code.
 * Required for admin operations (user deletion, …).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured.");
  return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
