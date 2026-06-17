export interface PlayerStats {
  quizGames: number;
  perfectQuiz: boolean;
  bestQuizStreak: number;
  mpGames: number;
  mpWins: number;
  dailyStreak: number;
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: (Omit<Achievement, "unlocked"> & { test: (s: PlayerStats) => boolean })[] = [
  { id: "first-quiz", name: "Premier pas", desc: "Jouer un Quizz du Jour", emoji: "👣", test: (s) => s.quizGames >= 1 },
  { id: "perfect", name: "Sans faute", desc: "Un quiz 100% correct", emoji: "🎯", test: (s) => s.perfectQuiz },
  { id: "streak5", name: "En feu", desc: "Série de 5 dans un quiz", emoji: "🔥", test: (s) => s.bestQuizStreak >= 5 },
  { id: "first-win", name: "Première victoire", desc: "Gagner une partie multi", emoji: "🏆", test: (s) => s.mpWins >= 1 },
  { id: "triple", name: "Triple menace", desc: "3 victoires multi", emoji: "⚔️", test: (s) => s.mpWins >= 3 },
  { id: "regular", name: "Habitué", desc: "10 quizz joués", emoji: "📚", test: (s) => s.quizGames >= 10 },
  { id: "daily3", name: "Assidu", desc: "3 jours d'affilée", emoji: "📅", test: (s) => s.dailyStreak >= 3 },
  { id: "expert", name: "Niveau Expert", desc: "Atteindre 1500 XP", emoji: "⭐", test: (s) => s.xp >= 1500 },
];

export function evaluateAchievements(s: PlayerStats): Achievement[] {
  return ACHIEVEMENTS.map(({ id, name, desc, emoji, test }) => ({
    id,
    name,
    desc,
    emoji,
    unlocked: test(s),
  }));
}

/**
 * Count consecutive days played, ending today (or yesterday if today is unplayed
 * so the streak doesn't reset before the day's first quiz). `dates` are YYYY-MM-DD.
 */
export function computeDailyStreak(dates: string[], today = new Date()): number {
  const set = new Set(dates);
  const cursor = new Date(today);
  const key = (d: Date) => d.toISOString().slice(0, 10);

  if (!set.has(key(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!set.has(key(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(key(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
