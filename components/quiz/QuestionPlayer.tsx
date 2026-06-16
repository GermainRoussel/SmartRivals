"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FastForward } from "lucide-react";
import { Question, QuestionType } from "@/types";
import {
  isAnswerCorrect,
  isSelfValidating,
  usesTextInput,
} from "@/lib/quiz/validation";
import { Button } from "@/components/ui/Button";

import { ChessQuestion } from "@/components/quiz/types/ChessQuestion";
import { OrderQuestion } from "@/components/quiz/types/OrderQuestion";
import { MatchingQuestion } from "@/components/quiz/types/MatchingQuestion";
import { SliderQuestion } from "@/components/quiz/types/SliderQuestion";
import { SortingQuestion } from "@/components/quiz/types/SortingQuestion";
import { HotspotQuestion } from "@/components/quiz/types/HotspotQuestion";
import { HoleTextQuestion } from "@/components/quiz/types/HoleTextQuestion";
import { BlindTestQuestion } from "@/components/quiz/types/BlindTestQuestion";
import { TrueFalseQuestion } from "@/components/quiz/types/TrueFalseQuestion";
import { ConnectionsQuestion } from "@/components/quiz/types/ConnectionsQuestion";
import { AnagramQuestion } from "@/components/quiz/types/AnagramQuestion";
import { PixelRevealQuestion } from "@/components/quiz/types/PixelRevealQuestion";
import { MathPuzzleQuestion } from "@/components/quiz/types/MathPuzzleQuestion";
import { RebusQuestion } from "@/components/quiz/types/RebusQuestion";
import { OddOneOutQuestion } from "@/components/quiz/types/OddOneOutQuestion";
import { WordGuessQuestion } from "@/components/quiz/types/WordGuessQuestion";
import { DifferencesQuestion } from "@/components/quiz/types/DifferencesQuestion";
import { PatternQuestion } from "@/components/quiz/types/PatternQuestion";

type Status = "idle" | "done";
type Feedback = "correct" | "incorrect";

interface QuestionPlayerProps {
  question: Question;
  /** Called once the question is resolved (validated, skipped or timed out). */
  onResult: (isCorrect: boolean, answer: unknown) => void;
  /** When it flips true (e.g. a countdown hit 0), the current answer is force-submitted. */
  timeUp?: boolean;
  /** Allow skipping self-validating puzzles (chess / connections). */
  allowSkip?: boolean;
}

export function QuestionPlayer({
  question,
  onResult,
  timeUp = false,
  allowSkip = false,
}: QuestionPlayerProps) {
  const { type } = question;
  const [answer, setAnswer] = useState<unknown>(null);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // NOTE: this component MUST be mounted with `key={question.id}` (both callers
  // do). A remount resets internal state — so there is intentionally no reset
  // effect here, which would otherwise clobber the initial answer that child
  // components (Order, Slider…) set in their own mount effects.

  const resolve = useCallback(
    (isCorrect: boolean, submitted: unknown) => {
      setStatus("done");
      setFeedback(isCorrect ? "correct" : "incorrect");
      onResult(isCorrect, submitted);
    },
    [onResult],
  );

  const validate = useCallback(() => {
    if (status === "done") return;
    const submitted = usesTextInput(type) ? inputValue : answer;
    resolve(isAnswerCorrect(question, submitted), submitted);
  }, [status, type, inputValue, answer, question, resolve]);

  // Self-validating components report correctness directly.
  const handleSelfValidated = useCallback(
    (isCorrect: boolean) => {
      if (status === "done") return;
      resolve(isCorrect, "complex");
    },
    [status, resolve],
  );

  const skip = useCallback(() => {
    if (status === "done") return;
    resolve(false, "skipped");
  }, [status, resolve]);

  // Force submit on timeout.
  useEffect(() => {
    if (timeUp && status === "idle") {
      if (isSelfValidating(type)) resolve(false, "timeout");
      else validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  const isFilled = useMemo(() => {
    if (usesTextInput(type)) return inputValue.trim().length > 0;
    if (type === QuestionType.MATCHING) {
      const m = (answer ?? {}) as Record<string, string>;
      return Object.keys(m).length === (question.pairs?.length ?? 0);
    }
    if (type === QuestionType.SORTING) {
      const m = (answer ?? {}) as Record<string, string>;
      return Object.keys(m).length === (question.sortingItems?.length ?? 0);
    }
    if (type === QuestionType.HOLE_TEXT) {
      const a = answer as string[] | null;
      return Array.isArray(a) && a.length > 0 && a.every((x) => x && x.length > 0);
    }
    return answer !== null && answer !== undefined;
  }, [type, inputValue, answer, question]);

  const frozen = status === "done";
  const selfValidating = isSelfValidating(type);

  return (
    <div className="flex flex-col">
      {/* Optional context image (not for types that render their own visual). */}
      {question.imageUrl &&
        ![
          QuestionType.HOTSPOT,
          QuestionType.PIXEL_REVEAL,
          QuestionType.DIFFERENCES,
          QuestionType.PATTERN,
        ].includes(type) && (
          <div className="mb-6 flex justify-center">
            <img
              src={question.imageUrl}
              alt=""
              className="rounded-xl shadow-md max-h-48 object-cover"
            />
          </div>
        )}

      <div className={`flex-grow ${frozen ? "pointer-events-none opacity-80" : ""}`}>
        <QuestionBody
          question={question}
          answer={answer}
          setAnswer={setAnswer}
          inputValue={inputValue}
          setInputValue={setInputValue}
          feedback={feedback}
          onSelfValidated={handleSelfValidated}
        />
      </div>

      {/* Action bar */}
      <div className="mt-8 flex items-center gap-3">
        {!selfValidating && (
          <Button
            fullWidth
            size="lg"
            onClick={validate}
            disabled={frozen || !isFilled}
            className={`border-b-4 transition-all ${
              feedback === "correct"
                ? "bg-green-500 border-green-700 hover:bg-green-500"
                : feedback === "incorrect"
                  ? "bg-red-500 border-red-700 hover:bg-red-500"
                  : "bg-sidebar-text hover:bg-slate-800 text-white border-slate-950"
            }`}
          >
            {frozen
              ? feedback === "correct"
                ? "Correct !"
                : "Incorrect"
              : "Valider"}
          </Button>
        )}

        {selfValidating && !frozen && (
          <div className="w-full text-center text-slate-400 text-sm font-bold">
            Résolvez le puzzle ci-dessus
          </div>
        )}

        {selfValidating && allowSkip && !frozen && (
          <Button
            variant="ghost"
            onClick={skip}
            className="text-slate-400 hover:text-slate-600 whitespace-nowrap"
          >
            Passer <FastForward className="ml-2" size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QuestionBody — the per-type input UI (single source, no dup)       */
/* ------------------------------------------------------------------ */

interface BodyProps {
  question: Question;
  answer: unknown;
  setAnswer: (v: unknown) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  feedback: Feedback | null;
  onSelfValidated: (isCorrect: boolean) => void;
}

function QuestionBody({
  question,
  answer,
  setAnswer,
  inputValue,
  setInputValue,
  feedback,
  onSelfValidated,
}: BodyProps) {
  const { type } = question;

  switch (type) {
    case QuestionType.MCQ:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((opt) => {
            const isSelected = answer === opt;
            let cls = "border-slate-200 hover:border-blue-300 text-slate-700";
            if (isSelected) {
              cls = feedback
                ? feedback === "correct"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
                : "border-primary bg-blue-50 text-primary shadow-md";
            }
            return (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`p-4 text-left rounded-2xl border-2 transition-all font-bold text-lg active:scale-[0.98] shadow-sm ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case QuestionType.IMAGE_MCQ:
      // Image-based MCQ where each option is a label rendered over a shared image.
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((opt) => {
            const isSelected = answer === opt;
            let cls = "border-slate-200 hover:border-blue-300 text-slate-700";
            if (isSelected) {
              cls = feedback
                ? feedback === "correct"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
                : "border-primary bg-blue-50 text-primary shadow-md";
            }
            return (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`p-4 text-center rounded-2xl border-2 transition-all font-bold text-lg active:scale-[0.98] shadow-sm ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case QuestionType.INPUT:
      return (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Votre réponse..."
          autoFocus
          className={`w-full p-6 text-3xl font-bold text-center rounded-2xl border-2 outline-none transition-colors ${
            feedback
              ? feedback === "correct"
                ? "border-green-500 bg-green-50 text-green-800"
                : "border-red-500 bg-red-50 text-red-800"
              : "border-slate-200 focus:border-primary"
          }`}
        />
      );

    case QuestionType.CHESS:
      return (
        <div className="flex justify-center">
          <ChessQuestion question={question} onAnswer={onSelfValidated} />
        </div>
      );

    case QuestionType.CONNECTIONS:
      return (
        <ConnectionsQuestion
          question={question}
          onAnswer={() => onSelfValidated(true)}
        />
      );

    case QuestionType.ORDER:
      return <OrderQuestion question={question} onOrderChange={setAnswer} />;

    case QuestionType.MATCHING:
      return <MatchingQuestion question={question} onMatchChange={setAnswer} />;

    case QuestionType.SLIDER:
      return <SliderQuestion question={question} onValueChange={setAnswer} />;

    case QuestionType.SORTING:
      return <SortingQuestion question={question} onSortComplete={setAnswer} />;

    case QuestionType.HOTSPOT:
      return <HotspotQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.HOLE_TEXT:
      return <HoleTextQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.BLIND_TEST:
      return <BlindTestQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.TRUE_FALSE:
      return <TrueFalseQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.ANAGRAM:
      return <AnagramQuestion question={question} onAnswer={setInputValue} />;

    case QuestionType.PIXEL_REVEAL:
      return <PixelRevealQuestion question={question} onAnswer={setInputValue} />;

    case QuestionType.MATH_PUZZLE:
      return <MathPuzzleQuestion question={question} onAnswer={setInputValue} />;

    case QuestionType.REBUS:
      return <RebusQuestion question={question} onAnswer={setInputValue} />;

    case QuestionType.ODD_ONE_OUT:
      return <OddOneOutQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.WORD_GUESS:
      return <WordGuessQuestion question={question} onAnswer={setInputValue} />;

    case QuestionType.DIFFERENCES:
      return <DifferencesQuestion question={question} onAnswer={setAnswer} />;

    case QuestionType.PATTERN:
      return <PatternQuestion question={question} onAnswer={setAnswer} />;

    default:
      return (
        <div className="text-center text-slate-400 py-10">
          Type de question non supporté : {type}
        </div>
      );
  }
}
