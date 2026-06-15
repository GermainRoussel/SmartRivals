import { AppShell } from "@/components/layout/AppShell";

// NOTE: real authentication guard is wired in Phase 2 (Supabase middleware).
// For now this layout only provides the visual application shell.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
