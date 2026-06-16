import { describe, it, expect } from "vitest";
import {
  isAnswerCorrect,
  parseHoleAnswers,
  usesTextInput,
  isSelfValidating,
} from "@/lib/quiz/validation";
import { Question, QuestionType, QuestionTheme, QuestionDifficulty } from "@/types";

function q(partial: Partial<Question> & { type: QuestionType }): Question {
  return {
    id: "t",
    text: "",
    theme: QuestionTheme.LOGIC,
    difficulty: QuestionDifficulty.EASY,
    ...partial,
  } as Question;
}

describe("isAnswerCorrect", () => {
  it("MCQ: exact option match", () => {
    const question = q({ type: QuestionType.MCQ, correctAnswer: "Canberra" });
    expect(isAnswerCorrect(question, "Canberra")).toBe(true);
    expect(isAnswerCorrect(question, "Sydney")).toBe(false);
  });

  it("INPUT: case-insensitive and trimmed", () => {
    const question = q({ type: QuestionType.INPUT, correctAnswer: "Paris" });
    expect(isAnswerCorrect(question, "  paris ")).toBe(true);
    expect(isAnswerCorrect(question, "London")).toBe(false);
  });

  it("TRUE_FALSE: boolean match", () => {
    const question = q({ type: QuestionType.TRUE_FALSE, correctAnswer: false });
    expect(isAnswerCorrect(question, false)).toBe(true);
    expect(isAnswerCorrect(question, true)).toBe(false);
  });

  it("SLIDER: within tolerance", () => {
    const question = q({ type: QuestionType.SLIDER, correctAnswer: 100, tolerance: 5 });
    expect(isAnswerCorrect(question, 103)).toBe(true);
    expect(isAnswerCorrect(question, 110)).toBe(false);
  });

  it("ORDER: exact sequence", () => {
    const question = q({ type: QuestionType.ORDER, correctAnswer: ["a", "b", "c"] });
    expect(isAnswerCorrect(question, ["a", "b", "c"])).toBe(true);
    expect(isAnswerCorrect(question, ["a", "c", "b"])).toBe(false);
  });

  it("MATCHING: every pair correct", () => {
    const question = q({
      type: QuestionType.MATCHING,
      pairs: [
        { left: "FR", right: "Paris" },
        { left: "IT", right: "Rome" },
      ],
    });
    expect(isAnswerCorrect(question, { FR: "Paris", IT: "Rome" })).toBe(true);
    expect(isAnswerCorrect(question, { FR: "Rome", IT: "Paris" })).toBe(false);
    expect(isAnswerCorrect(question, { FR: "Paris" })).toBe(false);
  });

  it("SORTING: every item in the right group", () => {
    const question = q({
      type: QuestionType.SORTING,
      sortingItems: [
        { id: "1", content: "Banane", correctGroupId: "F" },
        { id: "2", content: "Poireau", correctGroupId: "L" },
      ],
    });
    expect(isAnswerCorrect(question, { "1": "F", "2": "L" })).toBe(true);
    expect(isAnswerCorrect(question, { "1": "L", "2": "L" })).toBe(false);
  });

  it("HOTSPOT: within target distance", () => {
    const question = q({ type: QuestionType.HOTSPOT, hotspotTarget: { x: 50, y: 50, tolerance: 10 } });
    expect(isAnswerCorrect(question, { x: 55, y: 50 })).toBe(true);
    expect(isAnswerCorrect(question, { x: 70, y: 50 })).toBe(false);
  });

  it("HOLE_TEXT: fills match the braces", () => {
    const question = q({ type: QuestionType.HOLE_TEXT, holeText: "Je suis ton {père}." });
    expect(isAnswerCorrect(question, ["père"])).toBe(true);
    expect(isAnswerCorrect(question, ["PÈRE"])).toBe(true);
    expect(isAnswerCorrect(question, ["mère"])).toBe(false);
  });

  it("self-validating types never pass through here", () => {
    expect(isAnswerCorrect(q({ type: QuestionType.CHESS }), "anything")).toBe(false);
    expect(isAnswerCorrect(q({ type: QuestionType.CONNECTIONS }), "anything")).toBe(false);
  });
});

describe("parseHoleAnswers", () => {
  it("extracts the braced tokens in order", () => {
    expect(parseHoleAnswers("exilé sur {Sainte-Hélène} en {1815}.")).toEqual([
      "Sainte-Hélène",
      "1815",
    ]);
  });
});

describe("type helpers", () => {
  it("usesTextInput flags free-text formats", () => {
    expect(usesTextInput(QuestionType.ANAGRAM)).toBe(true);
    expect(usesTextInput(QuestionType.MCQ)).toBe(false);
  });

  it("isSelfValidating flags chess and connections", () => {
    expect(isSelfValidating(QuestionType.CHESS)).toBe(true);
    expect(isSelfValidating(QuestionType.CONNECTIONS)).toBe(true);
    expect(isSelfValidating(QuestionType.MCQ)).toBe(false);
  });
});

describe("isAnswerCorrect — more formats & edge cases", () => {
  it("IMAGE_MCQ / ODD_ONE_OUT / PATTERN / BLIND_TEST use exact equality", () => {
    expect(isAnswerCorrect(q({ type: QuestionType.IMAGE_MCQ, correctAnswer: "Da Vinci" }), "Da Vinci")).toBe(true);
    expect(isAnswerCorrect(q({ type: QuestionType.ODD_ONE_OUT, correctAnswer: "3" }), "3")).toBe(true);
    expect(isAnswerCorrect(q({ type: QuestionType.PATTERN, correctAnswer: "B" }), "A")).toBe(false);
    expect(isAnswerCorrect(q({ type: QuestionType.BLIND_TEST, correctAnswer: "Sirène" }), "Sirène")).toBe(true);
  });

  it("DIFFERENCES validates by distance to the target", () => {
    const question = q({ type: QuestionType.DIFFERENCES, diffTarget: { x: 60, y: 40, tolerance: 14 } });
    expect(isAnswerCorrect(question, { x: 64, y: 42 })).toBe(true);
    expect(isAnswerCorrect(question, { x: 90, y: 40 })).toBe(false);
  });

  it("typed input is case-insensitive (anagram / rebus / word-guess)", () => {
    expect(isAnswerCorrect(q({ type: QuestionType.ANAGRAM, correctAnswer: "PORTUGAL" }), "portugal")).toBe(true);
    expect(isAnswerCorrect(q({ type: QuestionType.REBUS, correctAnswer: "I love coffee" }), "i love coffee")).toBe(true);
    expect(isAnswerCorrect(q({ type: QuestionType.WORD_GUESS, correctAnswer: "TIGRE" }), "tigre")).toBe(true);
  });

  it("SLIDER with tolerance 0 needs the exact value", () => {
    const question = q({ type: QuestionType.SLIDER, correctAnswer: 1912, tolerance: 0 });
    expect(isAnswerCorrect(question, 1912)).toBe(true);
    expect(isAnswerCorrect(question, 1913)).toBe(false);
  });

  it("rejects empty, null and partial answers", () => {
    expect(isAnswerCorrect(q({ type: QuestionType.MCQ, correctAnswer: "A" }), null)).toBe(false);
    expect(isAnswerCorrect(q({ type: QuestionType.INPUT, correctAnswer: "Paris" }), "")).toBe(false);
    expect(isAnswerCorrect(q({ type: QuestionType.ORDER, correctAnswer: ["a", "b"] }), null)).toBe(false);

    const matching = q({
      type: QuestionType.MATCHING,
      pairs: [{ left: "FR", right: "Paris" }, { left: "IT", right: "Rome" }],
    });
    expect(isAnswerCorrect(matching, { FR: "Paris" })).toBe(false); // partial

    const sorting = q({
      type: QuestionType.SORTING,
      sortingItems: [
        { id: "1", content: "x", correctGroupId: "F" },
        { id: "2", content: "y", correctGroupId: "L" },
      ],
    });
    expect(isAnswerCorrect(sorting, { "1": "F" })).toBe(false); // partial
  });
});
