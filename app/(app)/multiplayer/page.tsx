"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Users, KeyRound, Play, Loader2, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { pickQuestionIds, pickFilteredQuestionIds } from "@/lib/quiz/bank";
import { QuestionTheme, QuestionDifficulty } from "@/types";
import {
  createPrivateRoom,
  joinByCode,
  findMatch,
  leaveQueue,
  MP_QUESTION_COUNT,
} from "@/lib/multiplayer";

type Mode = "menu" | "private" | "setup" | "searching";
type Difficulty = QuestionDifficulty | "ANY";
const DIFFICULTIES: Difficulty[] = [
  "ANY",
  QuestionDifficulty.EASY,
  QuestionDifficulty.MEDIUM,
  QuestionDifficulty.HARD,
  QuestionDifficulty.EXPERT,
];

function newQuestionSeed() {
  return `mp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("menu");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themes, setThemes] = useState<QuestionTheme[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("ANY");

  const toggleTheme = (t: QuestionTheme) =>
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const startPublic = async () => {
    setError(null);
    setMode("searching");
    try {
      const ids = pickQuestionIds(newQuestionSeed(), MP_QUESTION_COUNT);
      const roomId = await findMatch(ids);
      if (roomId) {
        router.push(`/multiplayer/${roomId}`);
        return;
      }
      // Queued: wait to be matched (someone will add us to a room).
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("non connecté");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);
      supabase
        .channel(`mm:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "room_players", filter: `user_id=eq.${user.id}` },
          (payload) => {
            router.push(`/multiplayer/${(payload.new as { room_id: string }).room_id}`);
          },
        )
        .subscribe();
    } catch (e) {
      setError((e as Error).message);
      setMode("menu");
    }
  };

  const cancelSearch = async () => {
    await leaveQueue().catch(() => {});
    setMode("menu");
  };

  const createRoom = async () => {
    setBusy(true);
    setError(null);
    try {
      const ids = pickFilteredQuestionIds(newQuestionSeed(), MP_QUESTION_COUNT, {
        themes: themes.length ? themes : undefined,
        difficulty: difficulty === "ANY" ? undefined : difficulty,
      });
      const room = await createPrivateRoom(ids, { themes, difficulty });
      router.push(`/multiplayer/${room.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const join = async () => {
    if (joinCode.trim().length < 4) return;
    setBusy(true);
    setError(null);
    try {
      const room = await joinByCode(joinCode.trim());
      router.push(`/multiplayer/${room.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  if (mode === "searching") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 w-full max-w-md flex flex-col items-center animate-in fade-in">
          <div className="relative w-20 h-20 mb-6">
            <span className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <span className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Recherche d&apos;un adversaire…</h3>
          <p className="text-slate-500 mb-6 text-center">On vous met en relation dès qu&apos;un joueur est dispo.</p>
          <Button variant="ghost" onClick={cancelSearch}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-red-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner rotate-3">
          <Swords size={48} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-3">Multijoueur</h2>
        <p className="text-xl text-slate-500 max-w-md mx-auto font-medium">
          Affrontez vos amis ou des joueurs du monde entier.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 font-bold px-5 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {mode === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <button
            onClick={startPublic}
            className="group bg-white p-8 rounded-[32px] border-4 border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-50 w-32 h-32 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <Users size={40} className="text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Partie Publique</h3>
              <p className="text-slate-500 font-medium">Trouver un adversaire au hasard.</p>
            </div>
          </button>

          <button
            onClick={() => setMode("private")}
            className="group bg-white p-8 rounded-[32px] border-4 border-slate-100 hover:border-purple-400 hover:shadow-xl transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-purple-50 w-32 h-32 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <KeyRound size={40} className="text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Salle Privée</h3>
              <p className="text-slate-500 font-medium">Créer une partie ou rejoindre un ami.</p>
            </div>
          </button>
        </div>
      )}

      {mode === "private" && (
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full">
          <Button fullWidth size="lg" className="mb-4" onClick={() => setMode("setup")}>
            <SlidersHorizontal size={18} className="mr-2" /> Créer une salle
          </Button>
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-slate-400 font-bold">OU</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>
          <label className="block font-bold text-slate-700 mb-2">Entrer un code</label>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="CODE"
              maxLength={6}
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-xl uppercase placeholder:text-slate-300 focus:border-primary outline-none"
            />
            <Button
              onClick={join}
              disabled={busy || joinCode.trim().length < 4}
              aria-label="Rejoindre la salle"
            >
              {busy ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
            </Button>
          </div>
          <Button variant="ghost" fullWidth className="mt-6" onClick={() => setMode("menu")}>
            <X size={18} className="mr-1" /> Retour
          </Button>
        </div>
      )}

      {mode === "setup" && (
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-2xl w-full">
          <h3 className="text-2xl font-display font-bold text-slate-800 mb-6 text-center">
            Paramètres de la salle
          </h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Thèmes (tous par défaut)
              </span>
              {themes.length > 0 && (
                <button
                  onClick={() => setThemes([])}
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

          <div className="mb-8">
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

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setMode("private")} disabled={busy}>
              Retour
            </Button>
            <Button fullWidth size="lg" onClick={createRoom} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : "Lancer la salle"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
