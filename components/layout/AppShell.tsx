import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar />

      <main className="md:ml-64 min-h-screen p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
};
