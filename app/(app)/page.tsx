import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRank } from "@/lib/rank";
import { computeDailyStreak } from "@/lib/achievements";

function mondayOfThisWeek(): Date {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function HomePage() {
  const profile = await getProfile();

  // Signed-in snapshot (skipped for guests / when Supabase is unconfigured).
  let rank: ReturnType<typeof getRank> | null = null;
  let weekScore = 0;
  let weeklyRank: number | null = null;
  let mpWins = 0;
  let dailyStreak = 0;

  if (profile) {
    const supabase = await createClient();
    rank = getRank(profile.xp);

    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("score, quiz_date, created_at")
      .eq("user_id", profile.id);
    const list = attempts ?? [];

    dailyStreak = computeDailyStreak(list.map((a) => a.quiz_date as string));

    const monday = mondayOfThisWeek();
    weekScore = list
      .filter((a) => new Date(a.created_at as string) >= monday)
      .reduce((s, a) => s + a.score, 0);

    const { data: weekly } = await supabase.from("weekly_leaderboard").select("id").limit(100);
    weeklyRank = (weekly ?? []).findIndex((r) => r.id === profile.id) + 1 || null;

    const { count } = await supabase
      .from("match_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("won", true);
    mpWins = count ?? 0;
  }

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto mt-4 pb-24 md:pb-0 px-4">
      {/* Hero */}
      <div className="bg-[#E0F2FE] rounded-[48px] p-8 md:p-14 text-center relative overflow-hidden border-4 border-white shadow-xl min-h-[320px] md:min-h-[400px] flex flex-col justify-center items-center w-full">
        <div className="absolute top-10 left-10 text-4xl animate-bounce [animation-delay:700ms] hidden md:block">⚡</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce hidden md:block">⭐</div>
        <div className="absolute top-10 right-20 text-blue-400 text-5xl rotate-12 hidden md:block">✦</div>

        <div className="relative z-10 flex flex-col items-center w-full">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-600 mb-2">
            {profile ? (
              <>
                Bienvenue <span className="text-blue-600">{profile.username}</span> !
              </>
            ) : (
              "Bienvenue !"
            )}
          </h2>

          <div className="flex items-center justify-center mb-3 w-full">
            <Logo className="w-full max-w-[300px] h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500" />
          </div>

          <BrandName className="text-4xl md:text-6xl mb-4 drop-shadow-sm" />

          <p className="text-lg md:text-2xl text-slate-600 font-medium mb-6 px-4 font-display max-w-2xl">
            Affrontez les meilleurs cerveaux !
          </p>

          {/* Level + XP + streak (signed in) */}
          {profile && rank && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="px-4 py-1.5 bg-white/70 rounded-full text-sm font-bold text-blue-700 shadow-sm">
                Niv. {rank.level} · {rank.name}
              </span>
              <div className="w-40 h-2.5 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${rank.progress}%` }} />
              </div>
              {dailyStreak > 0 && (
                <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-bold shadow-sm">
                  🔥 {dailyStreak} j
                </span>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {profile ? (
              <>
                <Link href="/multiplayer" className={CTA_PRIMARY}>
                  Lancer une partie
                </Link>
                <Link href="/daily" className={CTA_SECONDARY}>
                  Quizz du Jour
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={CTA_PRIMARY}>
                  Se connecter
                </Link>
                <Link href="/types" className={CTA_SECONDARY}>
                  Explorer les quizz
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats snapshot (signed in) */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile emoji="📅" value={weekScore} label="Score (semaine)" />
          <StatTile emoji="🥇" value={weeklyRank ? `#${weeklyRank}` : "—"} label="Rang hebdo" />
          <StatTile emoji="⚔️" value={mpWins} label="Victoires multi" />
          <StatTile emoji="🔥" value={dailyStreak} label="Série (jours)" />
        </div>
      )}

    </div>
  );
}

const CTA_PRIMARY =
  "bg-[#FCD34D] hover:bg-[#FBBF24] text-slate-900 border-b-8 border-[#F59E0B] text-xl md:text-2xl px-10 md:px-14 py-5 rounded-full shadow-xl active:border-b-0 active:translate-y-2 transition-all w-full sm:w-auto font-display font-medium inline-flex items-center justify-center";

const CTA_SECONDARY =
  "bg-white hover:bg-slate-50 text-slate-700 border-b-8 border-slate-200 text-xl md:text-2xl px-10 md:px-14 py-5 rounded-full shadow-xl active:border-b-0 active:translate-y-2 transition-all w-full sm:w-auto font-display font-medium inline-flex items-center justify-center";

function StatTile({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <div className="bg-white p-5 rounded-3xl border-4 border-slate-100 text-center shadow-sm">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-black text-slate-800 leading-none">{value}</div>
      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-1.5">{label}</div>
    </div>
  );
}

