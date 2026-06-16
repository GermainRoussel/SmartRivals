"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Trophy, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuestionPlayer } from "@/components/quiz/QuestionPlayer";
import { getDailyQuestions, todayKey } from "@/lib/quiz/bank";
import { computePoints, nextStreak, maxPointsPerQuestion } from "@/lib/scoring";

const MAX_TIME = 15;
const FEEDBACK_MS = 1500;

export default function DailyPage() {
  const questions = useMemo(() => getDailyQuestions(todayKey()), []);

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
  const currentQ = questions[index];
  const finished = index >= questions.length;

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

  // --- Intro screen ---
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
        <div className="w-32 h-32 bg-blue-100 rounded-[40px] flex items-center justify-center mb-8 text-blue-600 shadow-inner -rotate-3">
          <Zap size={64} strokeWidth={2} className="fill-current" />
        </div>
        <h2 className="font-display text-4xl font-bold text-slate-800 mb-4">
          Le Quizz du Jour
        </h2>
        <p className="text-xl text-slate-500 mb-10 max-w-md">
          {questions.length} questions variées.
          <br />
          <span className="font-bold text-red-500 text-2xl">{MAX_TIME} secondes</span> par
          question.
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
    const maxScore = questions.length * maxPointsPerQuestion(MAX_TIME);
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
        <Trophy className="w-24 h-24 text-yellow-500 mb-6 animate-bounce" />
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-4">
          Quizz Terminé !
        </h2>
        <p className="text-2xl text-slate-500 mb-10">
          Score final : <span className="font-black text-primary text-4xl">{score} pts</span>
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">
          <Stat label="Série Max" value={`🔥 ${maxStreak}`} color="text-orange-500" />
          <Stat
            label="Précision"
            value={`${Math.round((score / maxScore) * 100)}%`}
            color="text-blue-500"
          />
          <Stat
            label="Correctes"
            value={`${correct}/${questions.length}`}
            color="text-green-500"
          />
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
