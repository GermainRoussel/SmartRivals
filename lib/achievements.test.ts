import { describe, it, expect } from "vitest";
import { evaluateAchievements, computeDailyStreak, PlayerStats } from "@/lib/achievements";

const base: PlayerStats = {
  quizGames: 0,
  perfectQuiz: false,
  bestQuizStreak: 0,
  mpGames: 0,
  mpWins: 0,
  dailyStreak: 0,
  xp: 0,
};

describe("evaluateAchievements", () => {
  it("unlocks nothing for a fresh player", () => {
    expect(evaluateAchievements(base).every((a) => !a.unlocked)).toBe(true);
  });

  it("unlocks the right badges from stats", () => {
    const on = new Set(
      evaluateAchievements({ ...base, quizGames: 12, perfectQuiz: true, mpWins: 3, xp: 1500 })
        .filter((a) => a.unlocked)
        .map((a) => a.id),
    );
    expect(on.has("first-quiz")).toBe(true);
    expect(on.has("perfect")).toBe(true);
    expect(on.has("regular")).toBe(true);
    expect(on.has("first-win")).toBe(true);
    expect(on.has("triple")).toBe(true);
    expect(on.has("expert")).toBe(true);
    expect(on.has("daily3")).toBe(false);
  });
});

describe("computeDailyStreak", () => {
  const today = new Date("2026-06-17T12:00:00Z");

  it("counts consecutive days ending today", () => {
    expect(computeDailyStreak(["2026-06-17", "2026-06-16", "2026-06-15"], today)).toBe(3);
  });

  it("breaks on a gap", () => {
    expect(computeDailyStreak(["2026-06-17", "2026-06-15"], today)).toBe(1);
  });

  it("still counts when today is unplayed but yesterday was", () => {
    expect(computeDailyStreak(["2026-06-16", "2026-06-15"], today)).toBe(2);
  });

  it("is 0 when neither today nor yesterday was played", () => {
    expect(computeDailyStreak(["2026-06-10"], today)).toBe(0);
  });
});
