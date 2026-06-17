import { describe, it, expect } from "vitest";
import { getRank, RANKS } from "@/lib/rank";

describe("getRank", () => {
  it("starts at Recrue, level 1", () => {
    const r = getRank(0);
    expect(r.name).toBe("Recrue");
    expect(r.level).toBe(1);
    expect(r.next).toBe("Apprenti");
  });

  it("promotes exactly at the threshold", () => {
    expect(getRank(250).name).toBe("Apprenti");
    expect(getRank(249).name).toBe("Recrue");
  });

  it("computes progress toward the next rank", () => {
    expect(getRank(125).progress).toBe(50); // halfway 0 → 250
  });

  it("caps at the top rank with 100% progress", () => {
    const top = getRank(99999);
    expect(top.name).toBe("Légende");
    expect(top.next).toBeNull();
    expect(top.progress).toBe(100);
    expect(top.level).toBe(RANKS.length);
  });

  it("clamps negative xp to Recrue", () => {
    expect(getRank(-50).name).toBe("Recrue");
  });
});
