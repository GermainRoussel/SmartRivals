import { Question, QuestionType } from "@/types";

/**
 * Single source of truth for answer validation.
 *
 * In v1 this logic was copy-pasted as a large switch in both DailyQuiz.tsx and
 * QuizTypes.tsx. It now lives here and is consumed everywhere a question is played.
 *
 * Note: CHESS and CONNECTIONS are *self-validating* — their components determine
 * correctness internally and report it directly, so they never reach this function.
 */

const TYPED_INPUT = new Set<QuestionType>([
  QuestionType.INPUT,
  QuestionType.ANAGRAM,
  QuestionType.PIXEL_REVEAL,
  QuestionType.MATH_PUZZLE,
  QuestionType.REBUS,
  QuestionType.WORD_GUESS,
]);

const DIRECT_EQUALITY = new Set<QuestionType>([
  QuestionType.MCQ,
  QuestionType.IMAGE_MCQ,
  QuestionType.BLIND_TEST,
  QuestionType.ODD_ONE_OUT,
  QuestionType.PATTERN,
  QuestionType.TRUE_FALSE,
]);

/** Parse `holeText` like "Je suis ton {père}." into ["père"]. */
export function parseHoleAnswers(holeText: string): string[] {
  return holeText
    .split(/({[^}]+})/g)
    .filter((p) => p.startsWith("{") && p.endsWith("}"))
    .map((p) => p.slice(1, -1));
}

function withinDistance(
  a: { x: number; y: number } | null | undefined,
  target: { x: number; y: number; tolerance?: number } | undefined,
): boolean {
  if (!a || !target) return false;
  const dist = Math.hypot(a.x - target.x, a.y - target.y);
  return dist <= (target.tolerance ?? 10);
}

export function isAnswerCorrect(question: Question, answer: unknown): boolean {
  const { type } = question;

  if (DIRECT_EQUALITY.has(type)) {
    return answer === question.correctAnswer;
  }

  if (TYPED_INPUT.has(type)) {
    const expected = String(question.correctAnswer ?? "")
      .toLowerCase()
      .trim();
    return String(answer ?? "")
      .toLowerCase()
      .trim() === expected;
  }

  switch (type) {
    case QuestionType.ORDER:
      return JSON.stringify(answer) === JSON.stringify(question.correctAnswer);

    case QuestionType.MATCHING: {
      const matches = (answer ?? {}) as Record<string, string>;
      const pairs = question.pairs ?? [];
      if (Object.keys(matches).length !== pairs.length) return false;
      return pairs.every((p) => matches[p.left] === p.right);
    }

    case QuestionType.SORTING: {
      const placed = (answer ?? {}) as Record<string, string>;
      const items = question.sortingItems ?? [];
      if (Object.keys(placed).length !== items.length) return false;
      return items.every((it) => placed[it.id] === it.correctGroupId);
    }

    case QuestionType.SLIDER: {
      const value = Number(answer);
      const target = Number(question.correctAnswer);
      return Math.abs(value - target) <= (question.tolerance ?? 0);
    }

    case QuestionType.HOTSPOT:
      return withinDistance(
        answer as { x: number; y: number },
        question.hotspotTarget,
      );

    case QuestionType.DIFFERENCES:
      return withinDistance(
        answer as { x: number; y: number },
        question.diffTarget,
      );

    case QuestionType.HOLE_TEXT: {
      const given = (answer ?? []) as string[];
      const expected = parseHoleAnswers(question.holeText ?? "");
      if (given.length !== expected.length) return false;
      return given.every(
        (g, i) => g.trim().toLowerCase() === expected[i].trim().toLowerCase(),
      );
    }

    // Self-validating types never reach here.
    case QuestionType.CHESS:
    case QuestionType.CONNECTIONS:
    default:
      return false;
  }
}

/** Types whose component reports correctness itself (no "Valider" button). */
export function isSelfValidating(type: QuestionType): boolean {
  return type === QuestionType.CHESS || type === QuestionType.CONNECTIONS;
}

/** Types answered through a free-text field. */
export function usesTextInput(type: QuestionType): boolean {
  return TYPED_INPUT.has(type);
}
