"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Mode clair" : "Mode sombre"}
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
      className={`flex items-center w-full rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors font-bold ${
        collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
      }`}
    >
      {dark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
      {!collapsed && (dark ? "Mode clair" : "Mode sombre")}
    </button>
  );
}
