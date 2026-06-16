"use client";
import React from 'react';
import { SquareData, Piece } from '../../lib/chess/types';

interface ChessBoardProps {
  board: SquareData[];
  selectedSquareId: string | null;
  validMoves: string[];
  lastMove: { from: string; to: string } | null;
  wrongMoveSquareId: string | null;
  onSquareClick: (square: SquareData) => void;
  onPieceDrop: (sourceId: string, targetId: string) => void;
  onPieceDragStart?: (square: SquareData) => void;
  isBoardDisabled: boolean;
}

const THEME = {
  light: '#ebecd0',
  dark: '#739552',
  highlight: 'rgba(255, 255, 0, 0.5)',
  error: '#fa412d',
  hintDot: 'rgba(0, 0, 0, 0.15)',
  hintRing: 'rgba(0, 0, 0, 0.15)'
};

const getPieceUrl = (piece: Piece) => {
  const colorChar = piece.color === 'white' ? 'w' : 'b';
  let typeChar = '';
  switch (piece.type) {
    case 'king': typeChar = 'k'; break;
    case 'queen': typeChar = 'q'; break;
    case 'rook': typeChar = 'r'; break;
    case 'bishop': typeChar = 'b'; break;
    case 'knight': typeChar = 'n'; break;
    case 'pawn': typeChar = 'p'; break;
  }
  return `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${colorChar}${typeChar}.png`;
};

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  board, selectedSquareId, validMoves, lastMove, wrongMoveSquareId,
  onSquareClick, onPieceDrop, onPieceDragStart, isBoardDisabled 
}) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, square: SquareData) => {
    if (isBoardDisabled) { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", square.id);
    e.dataTransfer.effectAllowed = "move";
    if (onPieceDragStart) onPieceDragStart(square);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isBoardDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    if (isBoardDisabled) return;
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== targetId) onPieceDrop(sourceId, targetId);
  };

  return (
    <div className="select-none inline-block w-full max-w-[600px] mx-auto">
       <div className="rounded-[3px] overflow-hidden shadow-2xl aspect-square w-full bg-[#312e2b]">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {board.map((square) => {
            const isSelected = square.id === selectedSquareId;
            const isDark = square.color === 'dark';
            const isValidMove = validMoves.includes(square.id);
            const isLastMove = lastMove && (lastMove.from === square.id || lastMove.to === square.id);
            const isWrong = wrongMoveSquareId === square.id;
            const hasPiece = !!square.piece;
            
            let bgColor = isDark ? THEME.dark : THEME.light;
            if (isWrong) bgColor = THEME.error;
            const coordColor = isDark ? '#ebecd0' : '#739552';
            const coordColorOverride = isWrong ? '#fff' : coordColor;
            const canDrag = !!square.piece && !isBoardDisabled && square.piece.color === 'white';

            return (
              <div
                key={square.id}
                data-square={square.id}
                onClick={() => !isBoardDisabled && onSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square.id)}
                className={`relative w-full h-full flex items-center justify-center ${!isBoardDisabled ? 'cursor-default' : ''}`}
                style={{ backgroundColor: bgColor }}
              >
                {isLastMove && !isWrong && (<div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: THEME.highlight }} />)}
                {isSelected && !isWrong && (<div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: THEME.highlight }} />)}
                {square.col === 0 && (<span className="absolute top-[2px] left-[2px] text-[10px] sm:text-xs font-bold leading-none pointer-events-none z-0 select-none" style={{ color: coordColorOverride }}>{8 - square.row}</span>)}
                {square.row === 7 && (<span className="absolute bottom-[1px] right-[2px] text-[10px] sm:text-xs font-bold leading-none pointer-events-none z-0 select-none" style={{ color: coordColorOverride }}>{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][square.col]}</span>)}
                {isValidMove && !hasPiece && (<div className="absolute rounded-full z-10 pointer-events-none" style={{ backgroundColor: THEME.hintDot, width: '32%', height: '32%' }} />)}
                {isValidMove && hasPiece && (<div className="absolute w-full h-full z-10 pointer-events-none p-[2px]"><div className="w-full h-full rounded-full" style={{ borderWidth: '6px', borderColor: THEME.hintRing, borderStyle: 'solid' }} /></div>)}
                {square.piece && (
                  <div className={`z-20 w-full h-full flex items-center justify-center ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`} draggable={canDrag} onDragStart={(e) => handleDragStart(e, square)}>
                    <img src={getPieceUrl(square.piece)} alt={square.piece.symbol} className="w-full h-full object-contain select-none pointer-events-none" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;