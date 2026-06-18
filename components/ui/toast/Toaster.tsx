"use client";

import { useToastStore } from "./useToastStore";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold max-w-xs
            animate-in slide-in-from-bottom-4 fade-in duration-300
            ${t.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : t.type === "success"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-white border-slate-200 text-slate-700"
            }`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Fermer"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
