"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

const STORAGE_KEY = "sr-sidebar-collapsed";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Restore the user's last choice (desktop only — mobile uses the bottom nav).
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <main
        className={`min-h-screen p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
};
