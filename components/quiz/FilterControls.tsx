"use client";

import { QuestionTheme, QuestionDifficulty } from "@/types";

export type Difficulty = QuestionDifficulty | "ANY";

export const DIFFICULTIES: Difficulty[] = [
  "ANY",
  QuestionDifficulty.EASY,
  QuestionDifficulty.MEDIUM,
  QuestionDifficulty.HARD,
  QuestionDifficulty.EXPERT,
];

export interface FilterControlsProps {
  themes: QuestionTheme[];
  difficulty: Difficulty;
  toggleTheme: (t: QuestionTheme) => void;
  resetThemes: () => void;
  setDifficulty: (d: Difficulty) => void;
}

export function FilterControls({
  themes,
  difficulty,
  toggleTheme,
  resetThemes,
  setDifficulty,
}: FilterControlsProps) {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Thèmes (tous par défaut)
          </span>
          {themes.length > 0 && (
            <button
              onClick={resetThemes}
              className="text-xs font-bold text-blue-500 hover:text-blue-700"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(QuestionTheme).map((t) => {
            const on = themes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTheme(t)}
                className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  on
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Difficulté
        </span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                difficulty === d
                  ? "bg-slate-800 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d === "ANY" ? "Mixte" : d}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
