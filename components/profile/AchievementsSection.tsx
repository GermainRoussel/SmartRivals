"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

interface Props {
  achievements: Achievement[];
  unlockedCount: number;
  dailyStreak: number;
  unlockedMap: Record<string, string>; // achievement_id → ISO date
}

export function AchievementsSection({ achievements, unlockedCount, dailyStreak, unlockedMap }: Props) {
  const [open, setOpen] = useState(true);
  const total = achievements.length;
  const now = Date.now();
  const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-lg text-slate-800">
            Succès ({unlockedCount}/{total})
          </h3>
          {dailyStreak > 0 && (
            <span className="text-sm font-bold text-orange-500">
              🔥 {dailyStreak} jour{dailyStreak > 1 ? "s" : ""} d&apos;affilée
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((a) => {
              const unlockedAt = unlockedMap[a.id];
              const isNew = unlockedAt
                ? now - new Date(unlockedAt).getTime() < TWO_DAYS_MS
                : false;
              return (
                <div
                  key={a.id}
                  title={a.desc}
                  className={`p-3 rounded-2xl border text-center transition-all relative ${
                    a.unlocked
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-slate-50 border-slate-100 opacity-60"
                  }`}
                >
                  {isNew && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      Nouveau
                    </span>
                  )}
                  <div className={`text-3xl mb-1 ${a.unlocked ? "" : "grayscale opacity-50"}`}>
                    {a.emoji}
                  </div>
                  <div className="font-bold text-sm text-slate-700">{a.name}</div>
                  <div className="text-xs text-slate-400 leading-tight mt-0.5">{a.desc}</div>
                  {unlockedAt && (
                    <div className="text-[10px] text-slate-300 mt-1">
                      {new Date(unlockedAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
