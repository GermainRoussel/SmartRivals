"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Trophy, Play, Zap, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuestionPlayer } from "@/components/quiz/QuestionPlayer";
import { loadDailyQuestionsForClient } from "@/app/actions/questions";
import { computePoints, nextStreak, maxPointsPerQuestion } from "@/lib/scoring";
import { saveDailyAttempt, getTodayAttempt, type TodayAttempt } from "@/app/actions/quiz";
import { syncAchievements } from "@/app/actions/achievements";
import { toastAchievement } from "@/components/ui/toast/useToastStore";
import { Confetti } from "@/components/ui/Confetti";

const MAX_TIME = 15;
const FEEDBACK_MS = 1500;

export default function DailyPage() {
  const [questions, setQuestions] = useState<import("@/types").Question[]>([]);

  // --- Already-played guard + question loading (merged into one loading phase) ---
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [todayResult, setTodayResult] = useState<TodayAttempt | null>(null);
  const [practice, setPractice] = useState(false);

  useEffect(() => {
    Promise.all([getTodayAttempt(), loadDailyQuestionsForClient()]).then(([result, qs]) => {
      setTodayResult(result);
      setQuestions(qs);
      setCheckingAttempt(false);
    });
  }, []);

  // --- Quiz state ---
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timeUp, setTimeUp] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const streakRef = useRef(0);
  const savedRef = useRef(false);
  const currentQ = questions[index];
  const finished = index >= questions.length;

  // Persist the result once when the quiz ends, then sync achievements.
  // Skipped in practice mode (already played today).
  useEffect(() => {
    if (finished && started && !savedRef.current && !practice) {
      savedRef.current = true;
      void saveDailyAttempt({
        score,
        correctCount: correct,
        total: questions.length,
        maxStreak,
      }).then(() =>
        syncAchievements().then((newOnes) => {
          newOnes.forEach((a) => toastAchievement(a.name, a.emoji));
        }),
      );
    }
  }, [finished, started, score, correct, questions.length, maxStreak, practice]);

  // Per-question countdown.
  useEffect(() => {
    if (!started || resolved || finished) return;
    if (timeLeft <= 0) {
      setTimeUp(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [started, resolved, finished, timeLeft]);

  const handleResult = useCallback(
    (isCorrect: boolean) => {
      if (resolved) return;
      setResolved(true);
      setFeedback(isCorrect ? "correct" : "incorrect");

      setScore((s) => s + computePoints({ isCorrect, timeRemaining: timeLeft, streak: streakRef.current }));
      const ns = nextStreak(streakRef.current, isCorrect);
      streakRef.current = ns;
      setStreak(ns);
      setMaxStreak((m) => Math.max(m, ns));
      if (isCorrect) setCorrect((c) => c + 1);

      const t = setTimeout(() => {
        setIndex((i) => i + 1);
        setTimeLeft(MAX_TIME);
        setTimeUp(false);
        setResolved(false);
        setFeedback(null);
      }, FEEDBACK_MS);
      return () => clearTimeout(t);
    },
    [resolved, timeLeft],
  );

  // --- Loading (checking attempt) ---
  if (checkingAttempt) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  // --- Already played today (and not in practice mode) ---
  if (todayResult && !practice) {
    const accuracy = todayResult.total
      ? Math.round((todayResult.correctCount / todayResult.total) * 100)
      : 0;
    const maxScore = todayResult.total * maxPointsPerQuestion(MAX_TIME);
    const efficiency = maxScore ? Math.round((todayResult.score / maxScore) * 100) : 0;
    return (
      <AlreadyPlayedScreen
        todayResult={todayResult}
        accuracy={accuracy}
        efficiency={efficiency}
        onPractice={() => {
          setPractice(true);
          savedRef.current = false;
        }}
      />
    );
  }

  // --- Intro screen ---
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
        <div className="w-32 h-32 bg-blue-100 rounded-[40px] flex items-center justify-center mb-8 text-blue-600 shadow-inner -rotate-3">
          <Zap size={64} strokeWidth={2} className="fill-current" />
        </div>
        <h2 className="font-display text-4xl font-bold text-slate-800 mb-4">
          {practice ? "Mode entraînement" : "Le Quizz du Jour"}
        </h2>
        <p className="text-xl text-slate-500 mb-10 max-w-md">
          {questions.length} questions variées.
          <br />
          <span className="font-bold text-red-500 text-2xl">{MAX_TIME} secondes</span> par
          question.
          {practice && (
            <span className="block mt-2 text-sm text-slate-400">
              Ce résultat ne sera pas enregistré.
            </span>
          )}
        </p>
        <Button
          size="lg"
          onClick={() => setStarted(true)}
          className="px-12 py-6 text-xl rounded-2xl animate-pulse shadow-xl shadow-blue-200"
        >
          C&apos;est parti ! <Play fill="currentColor" className="ml-3" />
        </Button>
      </div>
    );
  }

  // --- Result screen ---
  if (finished) {
    const accuracy = Math.round((correct / questions.length) * 100);
    const maxScore = questions.length * maxPointsPerQuestion(MAX_TIME);
    const efficiency = Math.round((score / maxScore) * 100);
    const celebrate = accuracy >= 70 || maxStreak >= 3;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95 relative">
        <Confetti active={celebrate} />
        <Trophy className="w-24 h-24 text-yellow-500 mb-6 animate-bounce" />
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-4">
          {practice ? "Entraînement terminé !" : "Quizz Terminé !"}
        </h2>
        <p className="text-2xl text-slate-500 mb-10">
          Score final : <span className="font-black text-primary text-4xl">{score} pts</span>
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">
          <Stat label="Série Max" value={`🔥 ${maxStreak}`} color="text-orange-500" />
          <Stat label="Précision" value={`${accuracy}%`} color="text-green-500" />
          <Stat label="Efficacité" value={`${efficiency}%`} color="text-blue-500" />
        </div>
        <Link href="/leaderboard">
          <Button size="lg">Voir le classement</Button>
        </Link>
      </div>
    );
  }

  // --- Active question ---
  return (
    <div className="max-w-3xl mx-auto mt-4 pb-20 md:pb-0">
      {/* Top bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
            />
          </div>
          <Clock size={20} className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-slate-400"} />
          <span className={`font-mono text-2xl font-bold ${timeLeft <= 5 ? "text-red-600" : "text-slate-700"}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
          <span className="text-slate-400 font-bold">SCORE</span>
          <span className="text-blue-600 font-black text-2xl">{score}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
          <Flame
            size={20}
            className={streak > 2 ? "text-orange-500" : "text-slate-300"}
            fill={streak > 2 ? "currentColor" : "none"}
          />
          <span className="text-orange-500 font-black text-2xl">{streak}</span>
        </div>
      </div>

      {/* Practice mode badge */}
      {practice && (
        <div className="mb-4 text-center">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wide">
            Mode entraînement — non enregistré
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 px-2">
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className={`bg-white rounded-[32px] p-6 md:p-10 shadow-xl border-b-8 transition-colors duration-500 relative min-h-[400px] flex flex-col ${
          feedback === "correct"
            ? "border-green-500 ring-4 ring-green-100"
            : feedback === "incorrect"
              ? "border-red-500 ring-4 ring-red-100"
              : "border-slate-100"
        }`}
      >
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-display font-bold text-slate-800 leading-relaxed mt-2 flex-1">
            {currentQ.text}
          </h3>
          <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm tracking-wide ml-4 whitespace-nowrap">
            {index + 1} / {questions.length}
          </div>
        </div>

        <QuestionPlayer
          key={currentQ.id}
          question={currentQ}
          onResult={handleResult}
          timeUp={timeUp}
          allowSkip
        />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`font-black text-3xl ${color}`}>{value}</div>
    </div>
  );
}

function useCountdown() {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return countdown;
}

function AlreadyPlayedScreen({
  todayResult,
  accuracy,
  efficiency,
  onPractice,
}: {
  todayResult: TodayAttempt;
  accuracy: number;
  efficiency: number;
  onPractice: () => void;
}) {
  const countdown = useCountdown();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
      <div className="w-28 h-28 bg-green-100 rounded-[40px] flex items-center justify-center mb-8 text-green-500 shadow-inner rotate-3">
        <CheckCircle size={56} strokeWidth={2} />
      </div>
      <h2 className="font-display text-4xl font-bold text-slate-800 mb-2">
        Déjà joué aujourd&apos;hui !
      </h2>
      <p className="text-slate-500 mb-1 text-lg">Prochain quiz dans</p>
      <p className="font-mono text-4xl font-black text-blue-600 mb-8 tracking-widest">
        {countdown}
      </p>

      <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">
        <Stat label="Score" value={`${todayResult.score} pts`} color="text-blue-500" />
        <Stat label="Précision" value={`${accuracy}%`} color="text-green-500" />
        <Stat label="Efficacité" value={`${efficiency}%`} color="text-orange-500" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/leaderboard">
          <Button size="lg">Voir le classement</Button>
        </Link>
        <Link href="/multiplayer">
          <Button size="lg" variant="outline">⚔️ Jouer en multi</Button>
        </Link>
        <Button size="lg" variant="outline" onClick={onPractice}>
          <RotateCcw size={18} className="mr-2" /> Entraînement
        </Button>
      </div>
    </div>
  );
}
