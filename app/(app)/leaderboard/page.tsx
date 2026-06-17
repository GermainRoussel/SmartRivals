import Link from "next/link";
import { Trophy, Medal, Swords, CalendarDays, Flame, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfile } from "@/lib/auth";
import { getRank } from "@/lib/rank";
import { Button } from "@/components/ui/Button";
import { ComingSoon } from "@/components/ui/ComingSoon";

function avatarFor(username: string, url: string | null) {
  return url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

function mondayOfThisWeek(): Date {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

interface WeeklyRow {
  id: string;
  username: string;
  avatar_url: string | null;
  total_score: number;
  games_played: number;
}

interface MpRow {
  id: string;
  username: string;
  avatar_url: string | null;
  games: number;
  wins: number;
  total_score: number;
}

interface BoardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  main: number;
  sub: string;
}

export default async function LeaderboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <ComingSoon
        title="Classement"
        phase="Phase 2"
        description="Le classement s'activera dès que Supabase sera connecté."
      />
    );
  }

  const supabase = await createClient();
  const profile = await getProfile();
  const userId = profile?.id ?? null;

  // Weekly quiz leaderboard (fetch a wide slice for ranking; display the top 10).
  const { data: weeklyData } = await supabase
    .from("weekly_leaderboard")
    .select("id, username, avatar_url, total_score, games_played")
    .limit(100);
  const weeklyAll = (weeklyData ?? []) as WeeklyRow[];

  // Multiplayer leaderboard view (0007_mp_leaderboard.sql). If the view isn't
  // applied yet, supabase returns an error and we degrade to an empty board.
  const { data: mpData } = await supabase
    .from("mp_leaderboard")
    .select("id, username, avatar_url, games, wins, total_score")
    .limit(100);
  const mpAll = (mpData ?? []) as MpRow[];

  // Current user's own numbers.
  let weekScore = 0;
  let weekGames = 0;
  let mpWins = 0;
  let mpGames = 0;
  if (userId) {
    const { data: mine } = await supabase
      .from("quiz_attempts")
      .select("score")
      .eq("user_id", userId)
      .gte("created_at", mondayOfThisWeek().toISOString());
    weekScore = mine?.reduce((s, a) => s + a.score, 0) ?? 0;
    weekGames = mine?.length ?? 0;

    const { count: wins } = await supabase
      .from("match_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("won", true);
    const { count: gamesC } = await supabase
      .from("match_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    mpWins = wins ?? 0;
    mpGames = gamesC ?? 0;
  }

  const weeklyRank = userId ? (weeklyAll.findIndex((r) => r.id === userId) + 1 || null) : null;
  const rank = profile ? getRank(profile.xp) : null;

  const weeklyEntries: BoardEntry[] = weeklyAll.slice(0, 10).map((r) => ({
    id: r.id,
    username: r.username,
    avatar_url: r.avatar_url,
    main: r.total_score,
    sub: `${r.games_played} ${r.games_played > 1 ? "parties" : "partie"}`,
  }));

  const mpEntries: BoardEntry[] = mpAll.slice(0, 10).map((r) => ({
    id: r.id,
    username: r.username,
    avatar_url: r.avatar_url,
    main: r.wins,
    sub: `${r.games} ${r.games > 1 ? "parties" : "partie"}${
      r.games ? ` · ${Math.round((r.wins / r.games) * 100)}%` : ""
    }`,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="font-display text-3xl font-bold text-slate-800">Classement</h2>

      {/* Vos performances */}
      {profile && rank ? (
        <section className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-5">Vos performances</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 md:w-64 shrink-0">
              <img
                src={avatarFor(profile.username, profile.avatar_url)}
                alt={profile.username}
                className="w-16 h-16 rounded-full bg-slate-100 border-4 border-white shadow-md"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 truncate">{profile.username}</div>
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mt-1">
                  Niv. {rank.level} · {rank.name}
                </span>
                <div className="mt-2 h-2 w-40 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${rank.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <PerfTile icon={<CalendarDays size={18} />} value={weekScore} label="Score (semaine)" />
              <PerfTile
                icon={<Trophy size={18} />}
                value={weeklyRank ? `#${weeklyRank}` : "—"}
                label="Rang hebdo"
              />
              <PerfTile icon={<Swords size={18} />} value={mpWins} label="Victoires multi" />
              <PerfTile
                icon={<Flame size={18} />}
                value={mpGames ? `${Math.round((mpWins / mpGames) * 100)}%` : "—"}
                label="Taux de victoire"
              />
            </div>
          </div>
          {weekGames === 0 && (
            <p className="text-sm text-slate-400 mt-4">
              Jouez le{" "}
              <Link href="/daily" className="text-primary font-bold hover:underline">
                Quizz du Jour
              </Link>{" "}
              pour apparaître dans le classement de la semaine.
            </p>
          )}
        </section>
      ) : (
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
            <LogIn size={28} />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-800 mb-1">Vos performances</h3>
          <p className="text-slate-500 mb-4">Connectez-vous pour suivre votre progression et votre rang.</p>
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        </section>
      )}

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Board
          title="Top Joueurs de la semaine"
          icon={<CalendarDays size={20} className="text-blue-500" />}
          unit="pts"
          entries={weeklyEntries}
          currentUserId={userId}
          emptyText="Aucun score cette semaine. Soyez le premier à jouer le Quizz du Jour !"
        />
        <Board
          title="Top Joueurs Multi"
          icon={<Swords size={20} className="text-red-500" />}
          unit="🏆"
          entries={mpEntries}
          currentUserId={userId}
          emptyText="Aucune partie multijoueur terminée pour l'instant. Lancez un duel !"
        />
      </div>
    </div>
  );
}

function PerfTile({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">{icon}</div>
      <div className="text-2xl font-black text-slate-800 leading-none">{value}</div>
      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

function Board({
  title,
  icon,
  unit,
  entries,
  currentUserId,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  unit: string;
  entries: BoardEntry[];
  currentUserId: string | null;
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center gap-2">
        {icon}
        <h3 className="font-display font-bold text-lg text-slate-800">{title}</h3>
      </div>
      {entries.length === 0 ? (
        <div className="p-10 text-center text-slate-400 font-medium">{emptyText}</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {entries.map((e, i) => {
            const isMe = e.id === currentUserId;
            return (
              <Link
                key={e.id}
                href={`/u/${e.id}`}
                className={`flex items-center p-4 transition-colors ${
                  isMe ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-8 text-center font-bold text-slate-400 mr-4">
                  {i === 0 ? (
                    <Trophy className="text-yellow-500 mx-auto" size={24} />
                  ) : i === 1 ? (
                    <Medal className="text-slate-400 mx-auto" size={24} />
                  ) : i === 2 ? (
                    <Medal className="text-amber-700 mx-auto" size={24} />
                  ) : (
                    i + 1
                  )}
                </div>
                <img
                  src={avatarFor(e.username, e.avatar_url)}
                  alt={e.username}
                  className="w-10 h-10 rounded-full bg-slate-100 mr-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {e.username}
                    {isMe && <span className="ml-2 text-xs text-blue-500 font-bold">(vous)</span>}
                  </div>
                  <div className="text-xs text-slate-500">{e.sub}</div>
                </div>
                <div className="font-display font-bold text-primary whitespace-nowrap">
                  {e.main} {unit}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
