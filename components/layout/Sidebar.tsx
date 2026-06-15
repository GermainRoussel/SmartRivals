"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";
import { NAV_ITEMS } from "./nav";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed hidden md:flex flex-col w-64 h-screen bg-white border-r border-blue-100 text-sidebar-text shadow-xl z-50">
      <div className="p-6 flex flex-col items-center">
        <div className="w-full mb-4 px-4">
          <Logo className="w-full h-auto max-h-28" />
        </div>
        <BrandName className="text-3xl mb-4" />
      </div>

      <nav className="flex-1 px-4 space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-display font-semibold ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm translate-x-2"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-1"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button
          type="button"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors font-bold"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
