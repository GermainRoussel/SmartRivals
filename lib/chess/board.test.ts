import { describe, it, expect } from "vitest";
import { fenToBoard, legalMovesFrom, moveResult } from "@/lib/chess/board";

const ROOK_MATE = "6k1/3R4/6K1/8/8/8/8/8 w - - 0 1";
const QUEEN_MATE = "k7/8/K7/8/8/8/5Q2/8 w - - 0 1";

describe("fenToBoard", () => {
  it("builds a 64-square board with pieces at the right ids", () => {
    const board = fenToBoard(ROOK_MATE);
    expect(board).toHaveLength(64);

    expect(board.find((s) => s.id === "G8")?.piece).toEqual({
      type: "king",
      color: "black",
      symbol: "",
    });
    const rook = board.find((s) => s.id === "D7")?.piece;
    expect(rook?.type).toBe("rook");
    expect(rook?.color).toBe("white");

    expect(board.find((s) => s.id === "A1")?.piece).toBeNull();
  });

  it("assigns light/dark square colours correctly", () => {
    const board = fenToBoard(ROOK_MATE);
    expect(board.find((s) => s.id === "A8")?.color).toBe("light");
    expect(board.find((s) => s.id === "B8")?.color).toBe("dark");
    expect(board.find((s) => s.id === "A1")?.color).toBe("dark");
  });
});

describe("legalMovesFrom", () => {
  it("returns uppercase destinations including the mating move", () => {
    const moves = legalMovesFrom(ROOK_MATE, "D7");
    expect(moves).toContain("D8");
    expect(moves.every((m) => /^[A-H][1-8]$/.test(m))).toBe(true);
  });
});

describe("moveResult", () => {
  it("detects the rook mate-in-1", () => {
    expect(moveResult(ROOK_MATE, "D7", "D8")?.isCheckmate).toBe(true);
  });

  it("detects the queen mate-in-1", () => {
    expect(moveResult(QUEEN_MATE, "F2", "F8")?.isCheckmate).toBe(true);
  });

  it("a legal but non-mating move is not checkmate", () => {
    const r = moveResult(ROOK_MATE, "D7", "D1");
    expect(r).not.toBeNull();
    expect(r?.isCheckmate).toBe(false);
  });

  it("returns null for an illegal move", () => {
    expect(moveResult(ROOK_MATE, "D7", "A1")).toBeNull();
  });
});
