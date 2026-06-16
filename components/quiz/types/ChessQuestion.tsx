"use client";

import React, { useState, useEffect } from "react";
import ChessBoard from "../../chess/ChessBoard";
import { SquareData } from "../../../lib/chess/types";
import { fenToBoard, legalMovesFrom, moveResult } from "../../../lib/chess/board";
import { Question } from "../../../types";
import { TriangleAlert, Trophy } from "lucide-react";

interface ChessQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

const MAX_ATTEMPTS = 2;

export const ChessQuestion: React.FC<ChessQuestionProps> = ({ question, onAnswer }) => {
  const [board, setBoard] = useState<SquareData[]>(() =>
    question.fen ? fenToBoard(question.fen) : [],
  );
  const [selectedSquare, setSelectedSquare] = useState<SquareData | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [wrongMoveId, setWrongMoveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setBoard(question.fen ? fenToBoard(question.fen) : []);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setWrongMoveId(null);
    setAttempts(0);
    setIsLocked(false);
    setMessage(null);
  }, [question.id, question.fen]);

  // Legal moves come from the original position (puzzles are a single move).
  useEffect(() => {
    if (selectedSquare?.piece && question.fen) {
      setValidMoves(legalMovesFrom(question.fen, selectedSquare.id));
    } else {
      setValidMoves([]);
    }
  }, [selectedSquare, question.fen]);

  const handleSquareClick = (clicked: SquareData) => {
    if (isLocked || wrongMoveId) return;
    if (!selectedSquare) {
      if (clicked.piece?.color === "white") setSelectedSquare(clicked);
      return;
    }
    if (clicked.id === selectedSquare.id) {
      setSelectedSquare(null);
      return;
    }
    if (clicked.piece?.color === "white") {
      setSelectedSquare(clicked);
      return;
    }
    attemptMove(selectedSquare, clicked);
  };

  const handlePieceDragStart = (square: SquareData) => {
    if (isLocked || wrongMoveId) return;
    if (square.piece?.color === "white") setSelectedSquare(square);
  };

  const handlePieceDrop = (sourceId: string, targetId: string) => {
    if (isLocked || wrongMoveId || !question.fen) return;
    const source = board.find((sq) => sq.id === sourceId);
    const target = board.find((sq) => sq.id === targetId);
    if (source?.piece?.color === "white" && target) {
      if (legalMovesFrom(question.fen, sourceId).includes(targetId)) {
        attemptMove(source, target);
      } else {
        setSelectedSquare(source);
      }
    }
  };

  const attemptMove = (fromSquare: SquareData, toSquare: SquareData) => {
    if (!validMoves.includes(toSquare.id) || !question.fen) {
      setSelectedSquare(null);
      return;
    }

    // Move the piece on the display board.
    setBoard((prev) =>
      prev.map((sq) => {
        if (sq.id === fromSquare.id) return { ...sq, piece: null };
        if (sq.id === toSquare.id) return { ...sq, piece: fromSquare.piece };
        return sq;
      }),
    );
    setLastMove({ from: fromSquare.id, to: toSquare.id });
    setSelectedSquare(null);

    // Validate via chess.js: a mate puzzle is solved by delivering checkmate;
    // an exact-move puzzle accepts the stored "FROM-TO" answer.
    const result = moveResult(question.fen, fromSquare.id, toSquare.id);
    const playedMove = `${fromSquare.id}-${toSquare.id}`;
    const isCorrect =
      (result?.isCheckmate ?? false) || playedMove === question.correctAnswer;

    if (isCorrect) {
      setMessage({ text: "Mat ! Bien joué.", type: "success" });
      setIsLocked(true);
      setTimeout(() => onAnswer(true), 1200);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setWrongMoveId(toSquare.id);

    if (newAttempts >= MAX_ATTEMPTS) {
      setMessage({ text: "Échec. Vous avez utilisé tous vos essais.", type: "error" });
      setIsLocked(true);
      setTimeout(() => onAnswer(false), 2000);
    } else {
      setMessage({ text: "Mauvais coup. Réessayez.", type: "error" });
      setTimeout(() => {
        if (question.fen) setBoard(fenToBoard(question.fen));
        setLastMove(null);
        setWrongMoveId(null);
        setMessage(null);
      }, 1000);
    }
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-[400px] mx-auto relative select-none">
        <div className="w-full relative rounded-lg overflow-hidden shadow-lg border-4 border-[#312e2b]">
          <ChessBoard
            board={board}
            selectedSquareId={selectedSquare?.id || null}
            validMoves={validMoves}
            lastMove={lastMove}
            wrongMoveSquareId={wrongMoveId}
            onSquareClick={handleSquareClick}
            onPieceDrop={handlePieceDrop}
            onPieceDragStart={handlePieceDragStart}
            isBoardDisabled={isLocked}
          />

          {message && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div
                className={`bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center transform scale-110 animate-in zoom-in-90 duration-200 border-4 ${
                  message.type === "success" ? "border-[#81b64c]" : "border-[#fa412d]"
                }`}
              >
                {message.type === "success" ? (
                  <Trophy size={48} className="text-[#81b64c] mb-2 fill-current" />
                ) : (
                  <TriangleAlert size={48} className="text-[#fa412d] mb-2 fill-current" />
                )}
                <span
                  className={`text-xl font-black uppercase tracking-wider ${
                    message.type === "success" ? "text-[#81b64c]" : "text-[#fa412d]"
                  }`}
                >
                  {message.type === "success" ? "Victoire !" : "Raté"}
                </span>
                <p className="text-slate-600 font-bold text-sm mt-1">{message.text}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full mt-4 bg-[#302e2b] p-3 rounded-lg border border-[#3d3a36] shadow-sm">
          <div className="flex justify-between text-[10px] font-bold uppercase text-[#9a9996] mb-1.5 tracking-wider">
            <span>Essais autorisés</span>
            <span className={attempts > 0 ? "text-[#fa412d]" : "text-[#81b64c]"}>
              {MAX_ATTEMPTS - attempts} restants
            </span>
          </div>
          <div className="flex gap-1 h-2">
            {[...Array(MAX_ATTEMPTS)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-[2px] transition-colors duration-300 ${
                  i < MAX_ATTEMPTS - attempts ? "bg-[#81b64c]" : "bg-[#fa412d]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
