import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/toast/Toaster";

// NOTE: real authentication guard is wired in Phase 2 (Supabase middleware).
// For now this layout only provides the visual application shell.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <Toaster />
    </AppShell>
  );
}
