import { describe, it, expect } from "vitest";
import {
  computePoints,
  nextStreak,
  maxPointsPerQuestion,
  BASE_POINTS,
  TIME_BONUS_PER_SEC,
  STREAK_BONUS_PER_LEVEL,
} from "@/lib/scoring";

describe("computePoints", () => {
  it("returns 0 for a wrong answer", () => {
    expect(computePoints({ isCorrect: false, timeRemaining: 10, streak: 5 })).toBe(0);
  });

  it("awards base + time bonus with no streak", () => {
    expect(computePoints({ isCorrect: true, timeRemaining: 10, streak: 0 })).toBe(
      BASE_POINTS + 10 * TIME_BONUS_PER_SEC,
    );
  });

  it("adds the streak bonus", () => {
    expect(computePoints({ isCorrect: true, timeRemaining: 0, streak: 3 })).toBe(
      BASE_POINTS + 3 * STREAK_BONUS_PER_LEVEL,
    );
  });

  it("clamps negative time and streak to zero", () => {
    expect(computePoints({ isCorrect: true, timeRemaining: -5, streak: -2 })).toBe(BASE_POINTS);
  });
});

describe("nextStreak", () => {
  it("increments on a correct answer", () => expect(nextStreak(2, true)).toBe(3));
  it("resets to 0 on a wrong answer", () => expect(nextStreak(5, false)).toBe(0));
});

describe("maxPointsPerQuestion", () => {
  it("is base plus the full time bonus", () => {
    expect(maxPointsPerQuestion(15)).toBe(BASE_POINTS + 15 * TIME_BONUS_PER_SEC);
  });
});
