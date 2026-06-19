import { describe, it, expect } from "vitest";
import { simulateBotAnswer, type BotPersona } from "@/lib/bot";

const QMS = 15_000;
const TOTAL = QMS / 1000;

function persona(over: Partial<BotPersona> = {}): BotPersona {
  return { id: "bot-1", label: "Bot", accuracy: 0.7, speed: 0.6, ...over };
}

describe("simulateBotAnswer", () => {
  it("is deterministic for the same (seed, index, persona)", () => {
    const a = simulateBotAnswer("room-abc", 2, persona(), QMS);
    const b = simulateBotAnswer("room-abc", 2, persona(), QMS);
    expect(a).toEqual(b);
  });

  it("varies across question indices", () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      simulateBotAnswer("room-abc", i, persona(), QMS),
    );
    // Not all five answers should be byte-identical.
    const unique = new Set(results.map((r) => `${r.isCorrect}:${r.timeRemaining}`));
    expect(unique.size).toBeGreaterThan(1);
  });

  it("always answers correctly at accuracy 1", () => {
    for (let i = 0; i < 50; i++) {
      expect(simulateBotAnswer("seed", i, persona({ accuracy: 1 }), QMS).isCorrect).toBe(true);
    }
  });

  it("always answers wrong at accuracy 0", () => {
    for (let i = 0; i < 50; i++) {
      expect(simulateBotAnswer("seed", i, persona({ accuracy: 0 }), QMS).isCorrect).toBe(false);
    }
  });

  it("keeps timeRemaining within [0, total]", () => {
    for (let i = 0; i < 100; i++) {
      const { timeRemaining } = simulateBotAnswer("seed", i, persona({ speed: 0.9 }), QMS);
      expect(timeRemaining).toBeGreaterThanOrEqual(0);
      expect(timeRemaining).toBeLessThanOrEqual(TOTAL);
    }
  });

  it("a faster persona tends to leave more time on the clock", () => {
    const fast = persona({ speed: 0.2 });
    const slow = persona({ speed: 0.95 });
    let fastSum = 0;
    let slowSum = 0;
    for (let i = 0; i < 200; i++) {
      fastSum += simulateBotAnswer("seed", i, fast, QMS).timeRemaining;
      slowSum += simulateBotAnswer("seed", i, slow, QMS).timeRemaining;
    }
    expect(fastSum).toBeGreaterThan(slowSum);
  });
});
