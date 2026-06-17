import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRank } from "@/lib/rank";

function avatarFor(username: string, url: string | null) {
  return url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, xp")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  // quiz_attempts are world-readable; match results stay private (own-only).
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("correct_count, total, max_streak")
    .eq("user_id", id);

  const games = attempts?.length ?? 0;
  const totalCorrect = attempts?.reduce((s, a) => s + a.correct_count, 0) ?? 0;
  const totalQuestions = attempts?.reduce((s, a) => s + a.total, 0) ?? 0;
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestStreak = attempts?.reduce((m, a) => Math.max(m, a.max_streak), 0) ?? 0;
  const rank = getRank(profile.xp);

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
        <img
          src={avatarFor(profile.username, profile.avatar_url)}
          alt={profile.username}
          className="w-28 h-28 rounded-full bg-slate-100 mb-4 border-4 border-white shadow-lg object-cover"
        />
        <h2 className="text-3xl font-display font-bold text-slate-800">{profile.username}</h2>
        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mt-2 shadow-sm">
          Niveau {rank.level} · {rank.name}
        </span>
        {profile.bio && (
          <p className="text-slate-500 text-center max-w-md mt-3">{profile.bio}</p>
        )}

        <div className="mt-8 w-full grid grid-cols-3 gap-4 text-center">
          <Stat value={games} label="Quizz joués" />
          <Stat value={`${accuracy}%`} label="Précision" />
          <Stat value={`🔥 ${bestStreak}`} label="Série max" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
      <div className="text-3xl font-black text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
