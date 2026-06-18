import Link from "next/link";
import { LogIn, Swords, Pencil } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRank } from "@/lib/rank";
import { evaluateAchievements, computeDailyStreak, computeMpConsecWins, type PlayerStats } from "@/lib/achievements";
import { maxPointsPerQuestion } from "@/lib/scoring";
import { Button } from "@/components/ui/Button";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { DangerZone } from "@/components/profile/DangerZone";

function avatarFor(username: string, url: string | null) {
  return url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

interface MatchRow {
  score: number;
  rank: number;
  total_players: number;
  won: boolean;
  played_at: string;
}

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <div className="w-24 h-24 bg-blue-100 rounded-[32px] flex items-center justify-center mb-8 text-blue-500 shadow-inner -rotate-3">
          <LogIn size={48} strokeWidth={2} />
        </div>
        <h2 className="font-display text-4xl font-bold text-slate-800 mb-3">Profil</h2>
        <p className="text-lg text-slate-500 max-w-md mb-6">
          Connectez-vous pour suivre vos statistiques et votre progression.
        </p>
        <Link href="/login">
          <Button size="lg">Se connecter</Button>
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("score, correct_count, total, max_streak, quiz_date")
    .eq("user_id", profile.id);

  const { data: unlockedRows } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", profile.id);

  const { data: matches } = await supabase
    .from("match_results")
    .select("score, rank, total_players, won, played_at")
    .eq("user_id", profile.id)
    .order("played_at", { ascending: false })
    .limit(8);

  const { data: allMatchResults } = await supabase
    .from("match_results")
    .select("won")
    .eq("user_id", profile.id)
    .order("played_at", { ascending: true });

  const MAX_PER_Q = maxPointsPerQuestion(15);
  const games = attempts?.length ?? 0;
  const totalCorrect = attempts?.reduce((s, a) => s + a.correct_count, 0) ?? 0;
  const totalQuestions = attempts?.reduce((s, a) => s + a.total, 0) ?? 0;
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestStreak = attempts?.reduce((m, a) => Math.max(m, a.max_streak), 0) ?? 0;
  const perfectQuizCount = attempts?.filter((a) => a.correct_count === a.total).length ?? 0;
  const bestEfficiency = (attempts ?? []).reduce((best, a) => {
    const maxScore = (a.total as number) * MAX_PER_Q;
    const eff = maxScore > 0 ? Math.min(100, Math.round(((a.score as number) / maxScore) * 100)) : 0;
    return Math.max(best, eff);
  }, 0);
  const mpResultsList = (allMatchResults ?? []) as { won: boolean }[];
  const mpWins = mpResultsList.filter((r) => r.won).length;
  const mpConsecWins = computeMpConsecWins(mpResultsList);
  const recentMatches = (matches ?? []) as MatchRow[];
  const rank = getRank(profile.xp);

  const dailyStreak = computeDailyStreak((attempts ?? []).map((a) => a.quiz_date as string));
  const stats: PlayerStats = {
    quizGames: games,
    perfectQuiz: attempts?.some((a) => a.correct_count === a.total) ?? false,
    perfectQuizCount,
    bestQuizStreak: bestStreak,
    bestEfficiency,
    mpGames: mpResultsList.length,
    mpWins,
    mpConsecWins,
    dailyStreak,
    xp: profile.xp,
  };
  const achievements = evaluateAchievements(stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const unlockedMap: Record<string, string> = Object.fromEntries(
    (unlockedRows ?? []).map((r) => [r.achievement_id, r.unlocked_at as string]),
  );

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
        <img
          src={avatarFor(profile.username, profile.avatar_url)}
          alt={profile.username}
          className="w-32 h-32 rounded-full bg-slate-100 mb-4 border-4 border-white shadow-lg"
        />
        <h2 className="text-3xl font-display font-bold text-slate-800">{profile.username}</h2>

        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mt-2 shadow-sm">
          Niveau {rank.level} · {rank.name}
        </span>
        <div className="w-full max-w-xs mt-3">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${rank.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-bold mt-1">
            <span>{profile.xp} XP</span>
            {rank.next ? (
              <span>
                {rank.xpForLevel - rank.xpIntoLevel} XP → {rank.next}
              </span>
            ) : (
              <span>Niveau max 🏆</span>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-slate-500 text-center max-w-md mt-3">{profile.bio}</p>
        )}

        <Link href="/profile/edit" className="mt-4">
          <Button variant="outline" size="sm">
            <Pencil size={14} className="mr-1" /> Éditer le profil
          </Button>
        </Link>

        <div className="mt-8 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat value={games} label="Quizz joués" />
          <Stat value={`${accuracy}%`} label="Précision" />
          <Stat value={`🔥 ${bestStreak}`} label="Série max" />
          <Stat value={`🏆 ${mpWins}`} label="Victoires multi" />
        </div>
      </div>

      <AchievementsSection
        achievements={achievements}
        unlockedCount={unlockedCount}
        dailyStreak={dailyStreak}
        unlockedMap={unlockedMap}
      />

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-2 font-display font-bold text-lg text-slate-800">
          <Swords size={20} className="text-red-500" /> Historique multijoueur
        </div>
        {recentMatches.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="mb-3">Aucune partie multi pour l&apos;instant.</p>
            <Link href="/multiplayer">
              <Button variant="outline" size="sm">Lancer un duel ⚔️</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentMatches.map((m, i) => (
              <div key={i} className="flex items-center p-4">
                <div className={`w-12 font-black ${m.won ? "text-yellow-500" : "text-slate-400"}`}>
                  #{m.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-700">
                    {m.won ? "Victoire 🏆" : `${m.rank}ᵉ sur ${m.total_players}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(m.played_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="font-display font-bold text-primary">{m.score} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DangerZone />
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
      <div className="text-3xl font-black text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}
