import { Chess, type Square } from "chess.js";
import { SquareData, Piece, PieceType } from "./types";

const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const TYPE_MAP: Record<string, PieceType> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

/** Build the renderable 8×8 board (ids like "A8") from a FEN, via chess.js. */
export function fenToBoard(fen: string): SquareData[] {
  const game = new Chess(fen);
  const ranks = game.board(); // rank 8 → 1, each file a → h
  const board: SquareData[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = ranks[r][c];
      const piece: Piece | null = cell
        ? { type: TYPE_MAP[cell.type], color: cell.color === "w" ? "white" : "black", symbol: "" }
        : null;
      board.push({
        id: `${COLS[c]}${8 - r}`,
        row: r,
        col: c,
        color: (r + c) % 2 === 1 ? "dark" : "light",
        piece,
      });
    }
  }
  return board;
}

/** Fully-legal destination squares (respecting checks/pins) for a piece. */
export function legalMovesFrom(fen: string, fromId: string): string[] {
  const game = new Chess(fen);
  return game
    .moves({ square: fromId.toLowerCase() as Square, verbose: true })
    .map((m) => m.to.toUpperCase());
}

/**
 * Apply a move to a position and report whether it delivers checkmate.
 * Returns null if the move is illegal.
 */
export function moveResult(
  fen: string,
  fromId: string,
  toId: string,
): { isCheckmate: boolean; isCheck: boolean } | null {
  const game = new Chess(fen);
  try {
    game.move({
      from: fromId.toLowerCase() as Square,
      to: toId.toLowerCase() as Square,
      promotion: "q",
    });
  } catch {
    return null;
  }
  return { isCheckmate: game.isCheckmate(), isCheck: game.inCheck() };
}
