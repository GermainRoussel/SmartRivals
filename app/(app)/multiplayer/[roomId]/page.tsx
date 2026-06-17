"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy, Crown, LogOut, Play, Clock, Copy, Check } from "lucide-react";
import { useRoom } from "@/components/multiplayer/useRoom";
import { QuestionPlayer } from "@/components/quiz/QuestionPlayer";
import { Button } from "@/components/ui/Button";
import { getQuestionsByIds } from "@/lib/quiz/bank";
import { computePoints, nextStreak } from "@/lib/scoring";
import {
  leaveRoom,
  startGame,
  setScore,
  setAnswered,
  advanceQuestion,
  promoteHost,
  recordMatchResult,
  MP_QUESTION_MS,
  type RoomPlayer,
} from "@/lib/multiplayer";

function playerName(p: RoomPlayer) {
  return p.profiles?.username ?? "Joueur";
}
function playerAvatar(p: RoomPlayer) {
  return (
    p.profiles?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(playerName(p))}`
  );
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { room, players, me, loading } = useRoom(roomId);

  const [now, setNow] = useState(() => Date.now());
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const answeredRef = useRef(-1);
  const promotingRef = useRef(false);
  const recordedRef = useRef(false);
  const advancedRef = useRef(-1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, []);

  const isHost = !!room && !!me && room.host_id === me;
  const idx = room?.current_index ?? 0;
  const total = room?.question_ids.length ?? 0;

  const questions = useMemo(
    () => (room ? getQuestionsByIds(room.question_ids) : []),
    [room],
  );
  const currentQ = questions[idx];

  const timeLeft = room?.question_ends_at
    ? Math.max(0, Math.ceil((new Date(room.question_ends_at).getTime() - now) / 1000))
    : 0;

  // Host drives question progression off the shared deadline.
  useEffect(() => {
    if (!room || room.status !== "playing" || !isHost || !room.question_ends_at) return;
    const ms = new Date(room.question_ends_at).getTime() - Date.now();
    const t = setTimeout(
      () => void advanceQuestion(roomId, room.current_index + 1, room.question_ids.length, MP_QUESTION_MS),
      Math.max(0, ms) + 400,
    );
    return () => clearTimeout(t);
  }, [room, isHost, roomId]);

  // Everyone present has answered the current question (used to advance early).
  const allAnswered = useMemo(
    () =>
      room?.status === "playing" &&
      players.length > 0 &&
      players.every((p) => (p.answered_index ?? -1) >= idx),
    [room?.status, players, idx],
  );

  // Host: as soon as everyone has answered, skip the rest of the countdown.
  // (Stable deps — players churn doesn't re-arm/cancel the short delay.)
  useEffect(() => {
    if (!isHost || !allAnswered || advancedRef.current >= idx) return;
    advancedRef.current = idx;
    const t = setTimeout(
      () => void advanceQuestion(roomId, idx + 1, total, MP_QUESTION_MS),
      900, // brief pause so the last answer's feedback is visible
    );
    return () => clearTimeout(t);
  }, [isHost, allAnswered, idx, total, roomId]);

  // If the host has left, promote the next player so the game can resume.
  useEffect(() => {
    if (!room || players.length === 0) return;
    const hostPresent = players.some((p) => p.user_id === room.host_id);
    if (!hostPresent && !promotingRef.current) {
      promotingRef.current = true;
      void promoteHost(roomId).finally(() => {
        promotingRef.current = false;
      });
    }
  }, [room, players, roomId]);

  // Record this player's result once, when the match ends.
  useEffect(() => {
    if (room?.status !== "finished" || !me || recordedRef.current || players.length === 0) return;
    recordedRef.current = true;
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex((p) => p.user_id === me) + 1;
    const myScore = sorted.find((p) => p.user_id === me)?.score ?? 0;
    void recordMatchResult({
      roomId,
      score: myScore,
      rank: myRank,
      totalPlayers: players.length,
      won: myRank === 1,
    });
  }, [room?.status, me, players, roomId]);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (answeredRef.current === idx) return;
      answeredRef.current = idx;
      scoreRef.current += computePoints({ isCorrect, timeRemaining: timeLeft, streak: streakRef.current });
      streakRef.current = nextStreak(streakRef.current, isCorrect);
      void setScore(roomId, scoreRef.current);
      // Stamp this question as answered (no-op if the column isn't there yet).
      void setAnswered(roomId, idx).catch(() => {});
    },
    [idx, timeLeft, roomId],
  );

  const quit = async () => {
    await leaveRoom(roomId).catch(() => {});
    router.push("/multiplayer");
  };

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ranked = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-slate-300" size={48} />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h2 className="font-display text-3xl font-bold text-slate-800 mb-4">Salle introuvable</h2>
        <Button onClick={() => router.push("/multiplayer")}>Retour</Button>
      </div>
    );
  }

  // ---------------- LOBBY ----------------
  if (room.status === "lobby") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm uppercase font-bold tracking-wider mb-2">
            Code de la salle
          </p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-3 text-5xl font-display font-black text-slate-800 tracking-widest mb-2 hover:text-primary transition-colors"
          >
            {room.code}
            {copied ? <Check className="text-green-500" size={28} /> : <Copy size={28} className="text-slate-300" />}
          </button>
          <p className="text-slate-500 mb-8">Partagez ce code pour inviter un ami.</p>

          <div className="space-y-3 mb-8 text-left">
            {players.map((p) => (
              <div key={p.user_id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                <img src={playerAvatar(p)} alt="" className="w-10 h-10 rounded-full bg-white" />
                <span className="font-bold text-slate-700 flex-1">{playerName(p)}</span>
                {p.user_id === room.host_id && <Crown className="text-yellow-500" size={20} />}
              </div>
            ))}
          </div>

          {isHost ? (
            <Button
              fullWidth
              size="lg"
              onClick={() => void startGame(roomId, MP_QUESTION_MS)}
              disabled={players.length < 1}
            >
              <Play fill="currentColor" className="mr-2" /> Démarrer la partie
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-slate-500 font-bold">
              <Loader2 className="animate-spin" size={20} /> En attente que l&apos;hôte lance…
            </div>
          )}

          <Button variant="ghost" className="mt-4" onClick={quit}>
            <LogOut size={18} className="mr-1" /> Quitter
          </Button>
        </div>
      </div>
    );
  }

  // ---------------- RESULTS ----------------
  if (room.status === "finished") {
    const winner = ranked[0];
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h2 className="font-display text-4xl font-bold text-slate-800 mb-2">Partie terminée !</h2>
        {winner && (
          <p className="text-xl text-slate-500 mb-8">
            🏆 <span className="font-bold text-slate-800">{playerName(winner)}</span> remporte la partie
          </p>
        )}
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 divide-y divide-slate-50 mb-8 overflow-hidden">
          {ranked.map((p, i) => (
            <div
              key={p.user_id}
              className={`flex items-center p-4 ${p.user_id === me ? "bg-blue-50" : ""}`}
            >
              <div className={`w-8 font-black ${i === 0 ? "text-yellow-500" : "text-slate-400"}`}>
                #{i + 1}
              </div>
              <img src={playerAvatar(p)} alt="" className="w-10 h-10 rounded-full bg-slate-100 mx-3" />
              <span className="font-bold text-slate-700 flex-1 text-left">{playerName(p)}</span>
              <span className="font-display font-bold text-primary">{p.score} pts</span>
            </div>
          ))}
        </div>
        <Button size="lg" onClick={() => router.push("/multiplayer")}>
          Retour au menu
        </Button>
      </div>
    );
  }

  // ---------------- PLAYING ----------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {/* Live scoreboard */}
      <div className="lg:col-span-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-fit order-2 lg:order-1">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-500" />
          <h3 className="font-bold text-slate-700">Classement</h3>
        </div>
        <div className="space-y-3">
          {ranked.map((p, i) => (
            <div
              key={p.user_id}
              className={`flex items-center p-3 rounded-2xl ${p.user_id === me ? "bg-blue-50 border border-blue-200" : "bg-slate-50"}`}
            >
              <div className={`font-black w-6 mr-2 ${i === 0 ? "text-yellow-500" : "text-slate-400"}`}>
                #{i + 1}
              </div>
              <img src={playerAvatar(p)} alt="" className="w-8 h-8 rounded-full mr-2 bg-white" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{playerName(p)}</div>
                <div className="text-xs text-slate-500">{p.score} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game area */}
      <div className="lg:col-span-3 order-1 lg:order-2">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
            Question {Math.min(idx + 1, total)}/{total}
          </span>
          <div
            className={`flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm font-mono font-bold text-xl ${timeLeft <= 5 ? "text-red-600" : "text-slate-700"}`}
          >
            <Clock size={18} className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-slate-400"} />
            {timeLeft}s
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl border-b-8 border-slate-100 min-h-[420px] flex flex-col">
          {currentQ ? (
            <>
              <h3 className="text-2xl font-display font-bold text-slate-800 mb-8">{currentQ.text}</h3>
              <QuestionPlayer
                key={idx}
                question={currentQ}
                onResult={handleAnswer}
                timeUp={timeLeft <= 0}
                allowSkip
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
