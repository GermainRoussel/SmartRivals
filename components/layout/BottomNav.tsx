"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";

// Mobile bottom bar shows the 5 primary destinations (profile lives elsewhere).
const MOBILE_ITEMS = NAV_ITEMS.filter((i) => i.path !== "/profile");

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all duration-200 ${
              isActive
                ? "text-primary bg-blue-50 -translate-y-1"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold mt-1">{item.shortLabel}</span>
          </Link>
        );
      })}
    </div>
  );
};
