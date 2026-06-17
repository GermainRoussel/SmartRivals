import Link from "next/link";
import { Trophy, Medal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserId } from "@/lib/auth";
import { WeeklyChart, type DayScore } from "@/components/leaderboard/WeeklyChart";
import { ComingSoon } from "@/components/ui/ComingSoon";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function emptyWeek(): DayScore[] {
  return DAYS.map((name) => ({ name, score: 0 }));
}

function avatarFor(username: string, url: string | null) {
  return url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

interface LeaderRow {
  id: string;
  username: string;
  avatar_url: string | null;
  total_score: number;
  games_played: number;
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
  const userId = await getUserId();

  const { data: leaders } = await supabase
    .from("weekly_leaderboard")
    .select("id, username, avatar_url, total_score, games_played")
    .limit(10);

  // Current user's per-day scores for the current week.
  const week = emptyWeek();
  if (userId) {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const { data: mine } = await supabase
      .from("quiz_attempts")
      .select("score, created_at")
      .eq("user_id", userId)
      .gte("created_at", monday.toISOString());

    mine?.forEach((a) => {
      const idx = (new Date(a.created_at).getDay() + 6) % 7;
      week[idx].score += a.score;
    });
  }

  const rows = (leaders ?? []) as LeaderRow[];

  return (
    <div className="space-y-8">
      <h2 className="font-display text-3xl font-bold text-slate-800">Classement</h2>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-medium mb-6">Vos performances cette semaine</h3>
        <WeeklyChart data={week} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-lg font-medium">Top Joueurs de la semaine</h3>
        </div>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-medium">
            Aucun score cette semaine. Soyez le premier à jouer le Quizz du Jour !
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rows.map((leader, i) => (
              <Link
                key={leader.id}
                href={`/u/${leader.id}`}
                className="flex items-center p-4 hover:bg-slate-50 transition-colors"
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
                  src={avatarFor(leader.username, leader.avatar_url)}
                  alt={leader.username}
                  className="w-10 h-10 rounded-full bg-slate-100 mr-4"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{leader.username}</div>
                  <div className="text-xs text-slate-500">{leader.games_played} parties</div>
                </div>
                <div className="font-display font-bold text-primary">{leader.total_score} pts</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
