import { SquareData, Piece } from './types';

export const getCoords = (id: string) => {
  const colStr = id.charAt(0);
  const rowStr = id.charAt(1);
  const col = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].indexOf(colStr);
  const row = 8 - parseInt(rowStr, 10);
  return { row, col };
};

export const getId = (row: number, col: number) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rank = 8 - row;
  return `${cols[col]}${rank}`;
};

export const isValidPos = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

export const getPieceAt = (board: SquareData[], r: number, c: number) => {
  if (!isValidPos(r, c)) return null;
  return board.find(sq => sq.row === r && sq.col === c)?.piece || null;
};

export const getLegalMoves = (board: SquareData[], piece: Piece, startId: string): string[] => {
  const { row, col } = getCoords(startId);
  const moves: string[] = [];
  const isWhite = piece.color === 'white';

  const addMoveIfValid = (r: number, c: number) => {
     if (!isValidPos(r, c)) return false;
     const targetPiece = getPieceAt(board, r, c);
     
     if (!targetPiece) {
       moves.push(getId(r, c));
       return true;
     } else {
       if (targetPiece.color !== piece.color) {
         moves.push(getId(r, c));
       }
       return false;
     }
  };

  const raycast = (directions: number[][]) => {
    directions.forEach(([dr, dc]) => {
       let r = row + dr;
       let c = col + dc;
       while (addMoveIfValid(r, c)) {
         r += dr;
         c += dc;
       }
    });
  };

  if (piece.type === 'rook') {
    raycast([[1,0], [-1,0], [0,1], [0,-1]]);
  } else if (piece.type === 'bishop') {
    raycast([[1,1], [1,-1], [-1,1], [-1,-1]]);
  } else if (piece.type === 'queen') {
    raycast([[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]]);
  } else if (piece.type === 'knight') {
    const jumps = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
    jumps.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
  } else if (piece.type === 'king') {
    const steps = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    steps.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
  } else if (piece.type === 'pawn') {
    const direction = isWhite ? -1 : 1;
    if (isValidPos(row + direction, col) && !getPieceAt(board, row + direction, col)) {
       moves.push(getId(row + direction, col));
       const startRow = isWhite ? 6 : 1;
       if (row === startRow && !getPieceAt(board, row + (direction * 2), col)) {
          moves.push(getId(row + (direction * 2), col));
       }
    }
    [[direction, 1], [direction, -1]].forEach(([dr, dc]) => {
       const target = getPieceAt(board, row + dr, col + dc);
       if (target && target.color !== piece.color) {
          moves.push(getId(row + dr, col + dc));
       }
    });
  }

  return moves;
};