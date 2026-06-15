export type PieceColor = 'white' | 'black';

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  symbol: string;
}

export interface SquareData {
  id: string;     // Algebraic notation, e.g., "A1"
  row: number;    // 0-7
  col: number;    // 0-7
  color: 'light' | 'dark';
  piece: Piece | null;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Move {
  from: string;
  to: string;
}