/** XP-based ranks. The level is the 1-based index of the highest rank reached. */
export const RANKS = [
  { name: "Recrue", xp: 0 },
  { name: "Apprenti", xp: 250 },
  { name: "Habitué", xp: 750 },
  { name: "Expert", xp: 1500 },
  { name: "Maître", xp: 3000 },
  { name: "Grand Maître", xp: 6000 },
  { name: "Légende", xp: 12000 },
] as const;

export interface Rank {
  name: string;
  level: number;
  next: string | null;
  /** 0–100 progress toward the next rank (100 when maxed). */
  progress: number;
  xpIntoLevel: number;
  xpForLevel: number;
}

export function getRank(xp: number): Rank {
  const safeXp = Math.max(0, xp);
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) {
    if (safeXp >= RANKS[k].xp) i = k;
  }
  const current = RANKS[i];
  const next = RANKS[i + 1] ?? null;

  const xpIntoLevel = safeXp - current.xp;
  const xpForLevel = next ? next.xp - current.xp : 0;
  const progress = next ? Math.round((xpIntoLevel / xpForLevel) * 100) : 100;

  return {
    name: current.name,
    level: i + 1,
    next: next?.name ?? null,
    progress,
    xpIntoLevel,
    xpForLevel,
  };
}
