/**
 * Synthesised blind-test sounds via the Web Audio API.
 *
 * No external audio files → works on every browser including Safari/iOS
 * (which can't play the .ogg files the v1 used), and no CORS/hotlink issues.
 */

export type SoundId = "alarm" | "siren" | "doorbell" | "phone" | "horn" | "laser";

export const SOUND_LABELS: Record<SoundId, string> = {
  alarm: "Réveil",
  siren: "Sirène",
  doorbell: "Sonnette",
  phone: "Téléphone",
  horn: "Klaxon",
  laser: "Laser",
};

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  start: number;
  dur: number;
  gain?: number;
  sweepTo?: number;
}

function tone(ctx: AudioContext, out: GainNode, o: ToneOpts) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? "square";
  osc.frequency.setValueAtTime(o.freq, ctx.currentTime + o.start);
  if (o.sweepTo) {
    osc.frequency.linearRampToValueAtTime(o.sweepTo, ctx.currentTime + o.start + o.dur);
  }
  // Soft attack/release to avoid clicks.
  const peak = o.gain ?? 0.25;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + o.start);
  g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + o.start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + o.start + o.dur);
  osc.connect(g).connect(out);
  osc.start(ctx.currentTime + o.start);
  osc.stop(ctx.currentTime + o.start + o.dur + 0.05);
}

/** Schedule one sound on the context. Returns its total duration in seconds. */
function schedule(ctx: AudioContext, out: GainNode, id: SoundId): number {
  switch (id) {
    case "alarm": {
      // Repeated high beeps.
      let t = 0;
      for (let i = 0; i < 5; i++) {
        tone(ctx, out, { freq: 880, type: "square", start: t, dur: 0.12, gain: 0.2 });
        t += 0.22;
      }
      return t;
    }
    case "siren": {
      // Up/down sweeps (police).
      let t = 0;
      for (let i = 0; i < 3; i++) {
        tone(ctx, out, { freq: 600, sweepTo: 1100, type: "sawtooth", start: t, dur: 0.4, gain: 0.18 });
        tone(ctx, out, { freq: 1100, sweepTo: 600, type: "sawtooth", start: t + 0.4, dur: 0.4, gain: 0.18 });
        t += 0.8;
      }
      return t;
    }
    case "doorbell": {
      // Ding-dong (two descending tones).
      tone(ctx, out, { freq: 660, type: "sine", start: 0, dur: 0.5, gain: 0.3 });
      tone(ctx, out, { freq: 520, type: "sine", start: 0.55, dur: 0.8, gain: 0.3 });
      return 1.4;
    }
    case "phone": {
      // Two-tone warble rings.
      let t = 0;
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 8; i++) {
          tone(ctx, out, { freq: i % 2 ? 480 : 440, type: "square", start: t, dur: 0.05, gain: 0.18 });
          t += 0.05;
        }
        t += 0.5; // pause between rings
      }
      return t;
    }
    case "horn": {
      // Low car horn (two stacked tones).
      tone(ctx, out, { freq: 200, type: "sawtooth", start: 0, dur: 0.9, gain: 0.2 });
      tone(ctx, out, { freq: 250, type: "sawtooth", start: 0, dur: 0.9, gain: 0.15 });
      return 1;
    }
    case "laser": {
      // Quick descending zap.
      tone(ctx, out, { freq: 1400, sweepTo: 200, type: "square", start: 0, dur: 0.35, gain: 0.2 });
      return 0.4;
    }
  }
}

export interface SoundHandle {
  stop: () => void;
}

/**
 * Play a sound. Must be called from a user gesture (click). Returns a handle
 * with `stop()`, and calls `onEnded` when the sound finishes naturally.
 */
export function playSound(id: SoundId, onEnded?: () => void): SoundHandle {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);

  void ctx.resume();
  const dur = schedule(ctx, master, id);

  const timer = setTimeout(() => {
    void ctx.close();
    onEnded?.();
  }, (dur + 0.1) * 1000);

  return {
    stop: () => {
      clearTimeout(timer);
      void ctx.close();
    },
  };
}
