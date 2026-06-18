"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "./nav";

// Mobile bottom bar shows the 5 primary destinations (profile lives elsewhere).
const MOBILE_ITEMS = NAV_ITEMS.filter((i) => i.path !== "/profile");

function DarkToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Mode clair" : "Mode sombre"}
      className="flex flex-col items-center justify-center p-2 rounded-xl w-12 transition-all duration-200 text-slate-400 hover:text-slate-600"
    >
      {dark ? <Sun size={22} strokeWidth={2} /> : <Moon size={22} strokeWidth={2} />}
      <span className="text-[10px] font-bold mt-1">{dark ? "Clair" : "Sombre"}</span>
    </button>
  );
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-1 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl w-12 transition-all duration-200 ${
              isActive
                ? "text-primary bg-blue-50 -translate-y-1"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold mt-1">{item.shortLabel}</span>
          </Link>
        );
      })}
      <DarkToggle />
    </div>
  );
};
