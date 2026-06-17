import { describe, it, expect } from "vitest";
import { SAMPLES, pickFilteredQuestionIds, getQuestionsByIds } from "@/lib/quiz/bank";
import { isAnswerCorrect } from "@/lib/quiz/validation";
import { DIFFERENCE_SCENES } from "@/lib/quiz/differences";
import { PATTERN_PUZZLES } from "@/lib/quiz/patterns";
import { HOTSPOT_SCENES } from "@/lib/quiz/hotspots";
import { moveResult } from "@/lib/chess/board";
import { Question, QuestionType, QuestionTheme, QuestionDifficulty } from "@/types";

// Types whose stored `correctAnswer` IS exactly what validation receives,
// so the canonical answer must validate. (Excludes MATCHING/SORTING/HOLE_TEXT,
// whose answer is derived, and the self-validating CHESS/CONNECTIONS.)
const DIRECT_ANSWER_TYPES = new Set<QuestionType>([
  QuestionType.MCQ,
  QuestionType.IMAGE_MCQ,
  QuestionType.BLIND_TEST,
  QuestionType.ODD_ONE_OUT,
  QuestionType.PATTERN,
  QuestionType.TRUE_FALSE,
  QuestionType.INPUT,
  QuestionType.ANAGRAM,
  QuestionType.PIXEL_REVEAL,
  QuestionType.MATH_PUZZLE,
  QuestionType.REBUS,
  QuestionType.WORD_GUESS,
  QuestionType.SLIDER,
  QuestionType.ORDER,
  QuestionType.HOTSPOT,
  QuestionType.DIFFERENCES,
]);

const allSamples: Question[] = Object.values(SAMPLES).flat();

describe("question bank integrity", () => {
  it("every sample has a unique id", () => {
    const ids = allSamples.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the canonical correct answer validates for every direct-answer type", () => {
    for (const q of allSamples) {
      if (!DIRECT_ANSWER_TYPES.has(q.type)) continue;
      expect(
        isAnswerCorrect(q, q.correctAnswer),
        `${q.id} (${q.type}) should accept its own correctAnswer`,
      ).toBe(true);
    }
  });
});

describe("generated 'spot the difference' scenes", () => {
  it("produce valid, distinct left/right SVGs with an in-bounds target", () => {
    for (const s of DIFFERENCE_SCENES) {
      expect(decodeURIComponent(s.left)).toContain("<svg");
      expect(s.left).not.toBe(s.right); // there IS a difference
      expect(s.target.x).toBeGreaterThanOrEqual(0);
      expect(s.target.x).toBeLessThanOrEqual(100);
      expect(s.target.tolerance).toBeGreaterThan(0);
    }
  });
});

describe("generated hotspot scenes", () => {
  it("produce a valid, self-contained SVG with an in-bounds target", () => {
    for (const scene of Object.values(HOTSPOT_SCENES)) {
      expect(decodeURIComponent(scene.image)).toContain("<svg");
      expect(scene.image.startsWith("data:image/svg+xml")).toBe(true);
      expect(scene.target.x).toBeGreaterThanOrEqual(0);
      expect(scene.target.x).toBeLessThanOrEqual(100);
      expect(scene.target.y).toBeGreaterThanOrEqual(0);
      expect(scene.target.y).toBeLessThanOrEqual(100);
      expect(scene.target.tolerance).toBeGreaterThan(0);
    }
  });
});

describe("generated logic patterns", () => {
  it("each puzzle's correctId is one of its options", () => {
    for (const p of PATTERN_PUZZLES) {
      expect(decodeURIComponent(p.grid)).toContain("<svg");
      expect(p.options.length).toBeGreaterThan(1);
      expect(p.options.map((o) => o.id)).toContain(p.correctId);
    }
  });
});

describe("chess puzzles", () => {
  it("every chess sample's stored solution is a real checkmate", () => {
    for (const cq of SAMPLES[QuestionType.CHESS] ?? []) {
      const [from, to] = String(cq.correctAnswer).split("-");
      const r = moveResult(cq.fen!, from, to);
      expect(r, `${cq.id}: ${cq.correctAnswer} should be legal`).not.toBeNull();
      expect(r?.isCheckmate, `${cq.id}: ${cq.correctAnswer} should be mate`).toBe(true);
    }
  });
});

describe("pickFilteredQuestionIds", () => {
  it("only returns questions of the requested theme", () => {
    const qs = getQuestionsByIds(pickFilteredQuestionIds("s1", 20, { themes: [QuestionTheme.GEO] }));
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.theme === QuestionTheme.GEO)).toBe(true);
  });

  it("only returns questions of the requested difficulty", () => {
    const qs = getQuestionsByIds(
      pickFilteredQuestionIds("s2", 20, { difficulty: QuestionDifficulty.EASY }),
    );
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.difficulty === QuestionDifficulty.EASY)).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    expect(pickFilteredQuestionIds("same", 5)).toEqual(pickFilteredQuestionIds("same", 5));
  });

  it("falls back to a non-empty set when the filter matches nothing", () => {
    const ids = pickFilteredQuestionIds("s3", 5, { themes: [QuestionTheme.CARS] });
    expect(ids.length).toBeGreaterThan(0);
  });
});
