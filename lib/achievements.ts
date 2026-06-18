export interface PlayerStats {
  quizGames: number;
  perfectQuiz: boolean;
  perfectQuizCount: number;
  bestQuizStreak: number;
  bestEfficiency: number;
  mpGames: number;
  mpWins: number;
  mpConsecWins: number;
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
  // --- Premiers pas ---
  { id: "first-quiz",     name: "Premier pas",       desc: "Jouer un Quizz du Jour",           emoji: "👣", test: (s) => s.quizGames >= 1 },
  { id: "perfect",        name: "Sans faute",         desc: "Un quiz 100 % correct",            emoji: "🎯", test: (s) => s.perfectQuiz },
  { id: "first-win",      name: "Première victoire",  desc: "Gagner une partie multi",          emoji: "🏆", test: (s) => s.mpWins >= 1 },

  // --- Assiduité (séries journalières) ---
  { id: "daily3",         name: "Assidu",             desc: "3 jours d'affilée",                emoji: "📅", test: (s) => s.dailyStreak >= 3 },
  { id: "week7",          name: "Semaine parfaite",   desc: "7 jours d'affilée",                emoji: "🗓️", test: (s) => s.dailyStreak >= 7 },
  { id: "two-weeks",      name: "Quinzaine",          desc: "14 jours d'affilée",               emoji: "🌙", test: (s) => s.dailyStreak >= 14 },
  { id: "month",          name: "Mois de feu",        desc: "30 jours d'affilée",               emoji: "🏅", test: (s) => s.dailyStreak >= 30 },

  // --- Maîtrise ---
  { id: "streak5",        name: "En feu",             desc: "Série de 5 dans un quiz",          emoji: "🔥", test: (s) => s.bestQuizStreak >= 5 },
  { id: "streak10",       name: "Série de légende",   desc: "Série de 10 dans un quiz",         emoji: "🔟", test: (s) => s.bestQuizStreak >= 10 },
  { id: "triple-perfect", name: "Tireur d'élite",     desc: "3 quiz sans faute",                emoji: "🏹", test: (s) => s.perfectQuizCount >= 3 },
  { id: "fast",           name: "Éclair",             desc: "Plus de 80 % d'efficacité",        emoji: "⚡", test: (s) => s.bestEfficiency >= 80 },

  // --- Volume ---
  { id: "regular",        name: "Habitué",            desc: "10 quizz joués",                   emoji: "📚", test: (s) => s.quizGames >= 10 },
  { id: "scholar",        name: "Élève studieux",     desc: "25 quizz joués",                   emoji: "🎓", test: (s) => s.quizGames >= 25 },
  { id: "genius",         name: "Cerveau d'or",       desc: "50 quizz joués",                   emoji: "🧠", test: (s) => s.quizGames >= 50 },
  { id: "veteran",        name: "Vétéran",            desc: "100 quizz joués",                  emoji: "🎖️", test: (s) => s.quizGames >= 100 },

  // --- Multijoueur ---
  { id: "triple",         name: "Triple menace",      desc: "3 victoires multi",                emoji: "⚔️", test: (s) => s.mpWins >= 3 },
  { id: "duelist",        name: "Duelliste",          desc: "5 parties multi jouées",           emoji: "🤺", test: (s) => s.mpGames >= 5 },
  { id: "gladiator",      name: "Gladiateur",         desc: "10 victoires multi",               emoji: "🗡️", test: (s) => s.mpWins >= 10 },
  { id: "invincible",     name: "Invincible",         desc: "5 victoires consécutives en multi",emoji: "👑", test: (s) => s.mpConsecWins >= 5 },

  // --- XP / Progression ---
  { id: "apprentice",     name: "Apprenti",           desc: "Atteindre 250 XP",                 emoji: "🌱", test: (s) => s.xp >= 250 },
  { id: "expert",         name: "Niveau Expert",      desc: "Atteindre 1500 XP",                emoji: "⭐", test: (s) => s.xp >= 1500 },
  { id: "master",         name: "Maître",             desc: "Atteindre 3000 XP",                emoji: "💫", test: (s) => s.xp >= 3000 },
  { id: "legend",         name: "Légende",            desc: "Atteindre 12 000 XP",              emoji: "🌟", test: (s) => s.xp >= 12000 },
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

/** Longest consecutive win streak from an ordered (asc) list of match results. */
export function computeMpConsecWins(results: { won: boolean }[]): number {
  let best = 0;
  let cur = 0;
  for (const r of results) {
    cur = r.won ? cur + 1 : 0;
    if (cur > best) best = cur;
  }
  return best;
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
