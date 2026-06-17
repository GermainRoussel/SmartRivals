import Link from "next/link";
import { LogIn, Swords } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

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
    .select("score, correct_count, total, max_streak")
    .eq("user_id", profile.id);

  const { data: matches } = await supabase
    .from("match_results")
    .select("score, rank, total_players, won, played_at")
    .eq("user_id", profile.id)
    .order("played_at", { ascending: false })
    .limit(8);

  const { count: mpWins } = await supabase
    .from("match_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("won", true);

  const games = attempts?.length ?? 0;
  const totalCorrect = attempts?.reduce((s, a) => s + a.correct_count, 0) ?? 0;
  const totalQuestions = attempts?.reduce((s, a) => s + a.total, 0) ?? 0;
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestStreak = attempts?.reduce((m, a) => Math.max(m, a.max_streak), 0) ?? 0;
  const recentMatches = (matches ?? []) as MatchRow[];

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
          {profile.xp} XP
        </span>

        <div className="mt-8 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat value={games} label="Quizz joués" />
          <Stat value={`${accuracy}%`} label="Précision" />
          <Stat value={`🔥 ${bestStreak}`} label="Série max" />
          <Stat value={`🏆 ${mpWins ?? 0}`} label="Victoires multi" />
        </div>
      </div>

      {recentMatches.length > 0 && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-2 font-display font-bold text-lg text-slate-800">
            <Swords size={20} className="text-red-500" /> Historique multijoueur
          </div>
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
        </div>
      )}
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
