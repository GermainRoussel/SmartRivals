/**
 * Auth/persistence is optional until a Supabase project is wired up.
 * While unconfigured the app stays fully browsable (no auth guard), so the
 * foundation can be built and reviewed before credentials exist.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
