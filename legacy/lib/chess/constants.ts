import { Piece, SquareData } from './types';

export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const PIECES: Record<string, Piece> = {
  wK: { type: 'king', color: 'white', symbol: '♔' },
  wQ: { type: 'queen', color: 'white', symbol: '♕' },
  wR: { type: 'rook', color: 'white', symbol: '♖' },
  wB: { type: 'bishop', color: 'white', symbol: '♗' },
  wN: { type: 'knight', color: 'white', symbol: '♘' },
  wP: { type: 'pawn', color: 'white', symbol: '♙' },
  bK: { type: 'king', color: 'black', symbol: '♚' },
  bQ: { type: 'queen', color: 'black', symbol: '♛' },
  bR: { type: 'rook', color: 'black', symbol: '♜' },
  bB: { type: 'bishop', color: 'black', symbol: '♝' },
  bN: { type: 'knight', color: 'black', symbol: '♞' },
  bP: { type: 'pawn', color: 'black', symbol: '♟' },
};

// Puzzle Configuration: White to move and Mate in 1
export const INITIAL_PUZZLE_PIECES: Record<string, Piece> = {
  'A8': PIECES.bK,
  'C8': PIECES.wB,
  'F7': PIECES.wQ,
  'E1': PIECES.wK,
};

export const SOLUTION_MOVE = {
  from: 'F7',
  to: 'B7'
};

export const MAX_ATTEMPTS = 2;

export const generateInitialBoard = (): SquareData[] => {
  const board: SquareData[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const algebraicId = `${COLS[c]}${ROWS[r]}`;
      const isDark = (r + c) % 2 === 1;
      const piece = INITIAL_PUZZLE_PIECES[algebraicId] || null;

      board.push({
        id: algebraicId,
        row: r,
        col: c,
        color: isDark ? 'dark' : 'light',
        piece: piece
      });
    }
  }
  return board;
};