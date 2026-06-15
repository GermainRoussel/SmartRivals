import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import { generateInitialBoard, SOLUTION_MOVE, MAX_ATTEMPTS } from '../../lib/chess/constants';
import { SquareData, GameStatus } from '../../lib/chess/types';
import { getLegalMoves } from '../../lib/chess/engine';
import { Trophy, TriangleAlert, RotateCcw, BrainCircuit, CircleHelp } from 'lucide-react';

const ChessPuzzle: React.FC = () => {
  const [board, setBoard] = useState<SquareData[]>(generateInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<SquareData | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [wrongMoveId, setWrongMoveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(MAX_ATTEMPTS);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [feedback, setFeedback] = useState<string>('White to move. Mate in 1.');

  const resetGame = () => {
    setBoard(generateInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setWrongMoveId(null);
    setAttempts(MAX_ATTEMPTS);
    setStatus('playing');
    setFeedback('White to move. Mate in 1.');
  };

  useEffect(() => {
    if (selectedSquare && selectedSquare.piece) {
      const moves = getLegalMoves(board, selectedSquare.piece, selectedSquare.id);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [selectedSquare, board]);

  const executeMove = (fromSq: SquareData, toSq: SquareData, isSolution: boolean) => {
     const newBoard = board.map(sq => {
        if (sq.id === fromSq.id) return { ...sq, piece: null };
        if (sq.id === toSq.id) return { ...sq, piece: fromSq.piece };
        return sq;
      });
      setBoard(newBoard);
      setLastMove({ from: fromSq.id, to: toSq.id });
      setSelectedSquare(null);

      if (isSolution) {
        setStatus('won');
        setFeedback("Checkmate! The Queen is protected by the Bishop.");
      } else {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        setWrongMoveId(toSq.id);

        if (newAttempts <= 0) {
           setFeedback(`Game Over. The solution was ${SOLUTION_MOVE.from} to ${SOLUTION_MOVE.to}.`);
           setStatus('lost');
        } else {
           setFeedback("Incorrect move.");
           setTimeout(() => {
             setBoard(prev => prev.map(sq => {
                 if (sq.id === fromSq.id) return { ...sq, piece: fromSq.piece };
                 if (sq.id === toSq.id) return { ...sq, piece: toSq.piece };
                 return sq;
             }));
             setLastMove(null);
             setWrongMoveId(null);
           }, 800);
        }
      }
  };

  const attemptMove = (fromSquare: SquareData, toSquare: SquareData) => {
    if (fromSquare.id === toSquare.id) { setSelectedSquare(null); return; }
    if (toSquare.piece && toSquare.piece.color === fromSquare.piece?.color) { setSelectedSquare(toSquare); return; }
    if (!validMoves.includes(toSquare.id)) { setSelectedSquare(null); return; }
    const isSolution = fromSquare.id === SOLUTION_MOVE.from && toSquare.id === SOLUTION_MOVE.to;
    executeMove(fromSquare, toSquare, isSolution);
  };

  const handleSquareClick = (clickedSquare: SquareData) => {
    if (status !== 'playing' || wrongMoveId) return;
    if (!selectedSquare) {
      if (clickedSquare.piece && clickedSquare.piece.color === 'white') setSelectedSquare(clickedSquare);
      return;
    }
    attemptMove(selectedSquare, clickedSquare);
  };

  const handlePieceDragStart = (square: SquareData) => {
    if (status !== 'playing') return;
    if (square.piece && square.piece.color === 'white') setSelectedSquare(square);
  };

  const handlePieceDrop = (sourceId: string, targetId: string) => {
    if (status !== 'playing' || wrongMoveId) return;
    const sourceSquare = board.find(sq => sq.id === sourceId);
    const targetSquare = board.find(sq => sq.id === targetId);
    if (sourceSquare && targetSquare && sourceSquare.piece) {
       if (sourceSquare.piece.color !== 'white') return;
       const moves = getLegalMoves(board, sourceSquare.piece, sourceId);
       if (moves.includes(targetId)) {
          const isSolution = sourceId === SOLUTION_MOVE.from && targetId === SOLUTION_MOVE.to;
          executeMove(sourceSquare, targetSquare, isSolution);
       } else {
          setSelectedSquare(sourceSquare);
       }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_350px] gap-8 items-start p-4">
      <div className="flex flex-col items-center w-full select-none">
          <div className="w-full max-w-[600px] flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 bg-slate-500 rounded-sm flex items-center justify-center text-white shadow-inner"><span className="text-xs font-bold">OPP</span></div>
            <div className="flex flex-col"><span className="text-sm font-bold text-slate-700 dark:text-white leading-tight">Opponent</span><span className="text-xs text-gray-500 dark:text-gray-400">1500</span></div>
          </div>
          <ChessBoard 
            board={board} selectedSquareId={selectedSquare?.id || null} validMoves={validMoves} lastMove={lastMove} wrongMoveSquareId={wrongMoveId}
            onSquareClick={handleSquareClick} onPieceDrop={handlePieceDrop} onPieceDragStart={handlePieceDragStart} isBoardDisabled={status !== 'playing' || !!wrongMoveId}
          />
          <div className="w-full max-w-[600px] flex items-center gap-3 mt-3 px-1">
            <div className="w-10 h-10 bg-slate-200 rounded-sm flex items-center justify-center text-black shadow-inner"><span className="text-xs font-bold">YOU</span></div>
            <div className="flex flex-col"><span className="text-sm font-bold text-slate-700 dark:text-white leading-tight">Player (You)</span><span className="text-xs text-gray-500 dark:text-gray-400">1200</span></div>
          </div>
      </div>
      <div className="w-full bg-[#262421] rounded-lg shadow-xl overflow-hidden flex flex-col h-auto lg:h-[600px]">
        <div className="p-4 bg-[#211f1c] border-b border-[#3d3a36] flex items-center gap-2"><BrainCircuit className="text-[#81b64c] w-6 h-6" /><span className="font-bold text-white text-lg tracking-tight">Daily Puzzle</span></div>
        <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
            <div className="text-center"><h2 className="text-xl font-bold text-white mb-1">Mate in 1</h2><p className="text-[#b4b4b3] text-sm flex items-center justify-center gap-2"><span className="w-3 h-3 bg-white inline-block rounded-full"></span> White to Move</p></div>
            <div className={`p-4 rounded border-l-[6px] shadow-md transition-all duration-300 ${status === 'playing' ? 'bg-[#3a3835] border-[#999]' : status === 'won' ? 'bg-[#2d3b2a] border-[#81b64c]' : 'bg-[#382322] border-red-500'}`}>
              <div className="flex items-center gap-2 mb-1">
                {status === 'won' && <Trophy className="w-4 h-4 text-[#81b64c]" />}
                {status === 'lost' && <TriangleAlert className="w-4 h-4 text-red-500" />}
                {status === 'playing' && <CircleHelp className="w-4 h-4 text-gray-400" />}
                <span className={`font-bold text-sm uppercase ${status === 'playing' ? 'text-white' : status === 'won' ? 'text-[#81b64c]' : 'text-red-500'}`}>{status === 'playing' ? 'Your Turn' : status === 'won' ? 'Solved!' : 'Failed'}</span>
              </div>
              <p className="text-white text-sm leading-snug">{feedback}</p>
            </div>
            <div className="bg-[#302e2b] p-4 rounded border border-[#3d3a36]">
              <div className="flex justify-between text-[10px] font-bold uppercase text-[#9a9996] mb-2 tracking-wider"><span>Mistakes Allowed</span><span>{attempts} Left</span></div>
              <div className="flex gap-1 h-3">{[...Array(MAX_ATTEMPTS)].map((_, i) => (<div key={i} className={`flex-1 rounded-[2px] transition-colors duration-300 ${i < attempts ? 'bg-[#81b64c]' : 'bg-[#fa412d]'}`} />))}</div>
            </div>
        </div>
        <div className="p-4 bg-[#211f1c] border-t border-[#3d3a36]">
            {status !== 'playing' ? (
              <button onClick={resetGame} className="w-full py-3 rounded-[4px] font-bold text-white bg-[#81b64c] hover:bg-[#a3d160] shadow-[0_4px_0_0_#5a8a2a] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 text-base"><RotateCcw className="w-5 h-5" />{status === 'won' ? 'Play Again' : 'Retry Puzzle'}</button>
            ) : (
              <button className="w-full py-3 rounded-[4px] font-bold text-[#9e9e9e] bg-[#3d3b38] cursor-not-allowed opacity-70 flex items-center justify-center gap-2 text-sm" disabled>Solve the puzzle...</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzle;