"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Users, KeyRound, Play, Loader2, X, SlidersHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { pickFilteredQuestionIds } from "@/lib/quiz/bank";
import { QuestionTheme } from "@/types";
import {
  FilterControls,
  type Difficulty,
} from "@/components/quiz/FilterControls";
import {
  createPrivateRoom,
  joinByCode,
  findMatch,
  matchWithBot,
  leaveQueue,
  MP_QUESTION_COUNT,
} from "@/lib/multiplayer";

type Mode = "menu" | "private" | "setup" | "searching";

/** How long to wait for a human before falling back to a bot opponent. */
const BOT_FALLBACK_MS = 8_000;

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending bot fallback when leaving the page.
  useEffect(() => () => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
  }, []);

  const filtersActive = themes.length > 0 || difficulty !== "ANY";

  const toggleTheme = (t: QuestionTheme) =>
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // Shared filter → question-ids helper, honoured by both public and private play.
  const pickIds = () =>
    pickFilteredQuestionIds(newQuestionSeed(), MP_QUESTION_COUNT, {
      themes: themes.length ? themes : undefined,
      difficulty: difficulty === "ANY" ? undefined : difficulty,
    });

  const startPublic = async () => {
    setError(null);
    setMode("searching");
    try {
      const ids = pickIds();
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
            if (botTimerRef.current) clearTimeout(botTimerRef.current);
            router.push(`/multiplayer/${(payload.new as { room_id: string }).room_id}`);
          },
        )
        .subscribe();

      // Anti cold-start: if no human shows up, fall back to a bot opponent.
      botTimerRef.current = setTimeout(async () => {
        try {
          const roomId = await matchWithBot(ids);
          // null ⇒ a real player matched us first; the channel will navigate.
          if (roomId) router.push(`/multiplayer/${roomId}`);
        } catch (e) {
          setError((e as Error).message);
          setMode("menu");
        }
      }, BOT_FALLBACK_MS);
    } catch (e) {
      setError((e as Error).message);
      setMode("menu");
    }
  };

  const cancelSearch = async () => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    await leaveQueue().catch(() => {});
    setMode("menu");
  };

  const createRoom = async () => {
    setBusy(true);
    setError(null);
    try {
      const ids = pickIds();
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
          {filtersActive && (
            <p className="text-xs font-bold text-blue-500 mb-4 text-center">
              Filtres actifs : {difficulty === "ANY" ? "" : `${difficulty}`}
              {difficulty !== "ANY" && themes.length ? " · " : ""}
              {themes.length ? `${themes.length} thème${themes.length > 1 ? "s" : ""}` : ""}
            </p>
          )}
          <Button variant="ghost" onClick={cancelSearch}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-red-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner rotate-3">
          <Swords size={48} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-3">Multijoueur</h2>
        <p className="text-xl text-slate-500 max-w-md mx-auto font-medium">
          Affrontez vos amis ou des joueurs du monde entier.
        </p>
      </div>

      {/* Preferences — shared theme/difficulty filters for public + private play. */}
      <button
        onClick={() => setSettingsOpen(true)}
        aria-label="Préférences de la partie"
        className={`mb-10 px-5 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold ${
          filtersActive
            ? "bg-blue-50 border-blue-300 text-blue-600"
            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
        }`}
      >
        <Settings size={18} />
        Préférences
        {filtersActive && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {(difficulty !== "ANY" ? 1 : 0) + themes.length}
          </span>
        )}
      </button>

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

          <FilterControls
            themes={themes}
            difficulty={difficulty}
            toggleTheme={toggleTheme}
            resetThemes={() => setThemes([])}
            setDifficulty={setDifficulty}
          />

          <div className="flex gap-3 mt-8">
            <Button variant="ghost" onClick={() => setMode("private")} disabled={busy}>
              Retour
            </Button>
            <Button fullWidth size="lg" onClick={createRoom} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : "Lancer la salle"}
            </Button>
          </div>
        </div>
      )}

      {/* Settings modal — shared filters for public + private play. */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="relative z-10 bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <Settings size={24} className="text-blue-500" />
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-800">Réglages de la partie</h3>
                  <p className="text-sm text-slate-500">Appliqués à la partie publique et aux salles que vous créez.</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Fermer"
                className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
              >
                <X size={26} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <FilterControls
                themes={themes}
                difficulty={difficulty}
                toggleTheme={toggleTheme}
                resetThemes={() => setThemes([])}
                setDifficulty={setDifficulty}
              />
              <Button fullWidth size="lg" className="mt-8" onClick={() => setSettingsOpen(false)}>
                Terminé
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

