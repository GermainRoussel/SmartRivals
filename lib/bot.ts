/**
 * Bot opponent simulation (B3 — anti cold-start).
 *
 * A bot has no client of its own; the human host's browser computes the bot's
 * answers and persists its score via the `set_bot_score` RPC. To keep play
 * consistent (and reproducible in tests), every answer is derived
 * deterministically from the room id + question index, so the same room always
 * unfolds the same way no matter who recomputes it.
 *
 * Bots are cosmetic opponents — they never touch leaderboards — so this is a
 * plausibility model, not an answer oracle: correctness is a seeded Bernoulli
 * draw against the persona's `accuracy`, and answer speed scales with `speed`.
 */

export interface BotPersona {
  id: string;
  label: string;
  /** Probability in [0,1] that the bot answers a given question correctly. */
  accuracy: number;
  /** In [0,1]: how much of the clock the bot tends to use (lower = faster). */
  speed: number;
}

export interface BotAnswer {
  isCorrect: boolean;
  /** Seconds left on the clock when the bot answers (feeds computePoints). */
  timeRemaining: number;
}

/** FNV-1a string hash → 32-bit unsigned int. */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 — tiny deterministic PRNG returning floats in [0,1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Deterministically simulate the bot's answer to one question.
 * `seed` should be a stable, room-scoped value (the room id).
 */
export function simulateBotAnswer(
  seed: string,
  questionIndex: number,
  persona: BotPersona,
  questionMs: number,
): BotAnswer {
  const rng = mulberry32(hashString(`${seed}:${questionIndex}`));
  const rCorrect = rng();
  const rSpeed = rng();

  const isCorrect = rCorrect < persona.accuracy;

  const totalSec = questionMs / 1000;
  // Use roughly 60–100% of the persona's "speed" budget, jittered per question.
  const usedFraction = clamp(persona.speed * (0.6 + 0.4 * rSpeed), 0.05, 0.98);
  const timeRemaining = Math.max(0, Math.round(totalSec * (1 - usedFraction)));

  return { isCorrect, timeRemaining };
}
