"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";
import { signOut } from "@/app/actions/auth";
import { NAV_ITEMS } from "./nav";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed hidden md:flex flex-col h-screen bg-white border-r border-blue-100 text-sidebar-text shadow-xl z-50 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand / logo */}
      <div className={`flex flex-col items-center ${collapsed ? "p-3" : "p-6"}`}>
        {collapsed ? (
          <Logo className="w-10 h-auto" />
        ) : (
          <>
            <div className="w-full mb-4 px-4">
              <Logo className="w-full h-auto max-h-28" />
            </div>
            <BrandName className="text-3xl" />
          </>
        )}
      </div>

      {/* Collapse / expand toggle */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        className={`mb-2 mx-4 flex items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors ${
          collapsed ? "justify-center p-2" : "justify-end gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider"
        }`}
      >
        {collapsed ? (
          <ChevronRight size={20} />
        ) : (
          <>
            Réduire <ChevronLeft size={16} />
          </>
        )}
      </button>

      <nav className={`flex-1 space-y-3 ${collapsed ? "px-3" : "px-4"}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-2xl transition-all duration-200 font-display font-semibold ${
                collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
              } ${
                isActive
                  ? `bg-blue-50 text-blue-600 shadow-sm ${collapsed ? "" : "translate-x-2"}`
                  : `text-slate-500 hover:bg-slate-50 hover:text-slate-800 ${collapsed ? "" : "hover:translate-x-1"}`
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={collapsed ? "p-3" : "p-6"}>
        <form action={signOut}>
          <button
            type="submit"
            title={collapsed ? "Déconnexion" : undefined}
            className={`flex items-center w-full rounded-2xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors font-bold ${
              collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            }`}
          >
            <LogOut size={20} strokeWidth={2.5} />
            {!collapsed && "Déconnexion"}
          </button>
        </form>
      </div>
    </aside>
  );
};
