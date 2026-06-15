
import React, { useState, useEffect } from 'react';
import ChessBoard from '../../chess/ChessBoard';
import { SquareData, Piece, PieceType, PieceColor } from '../../../lib/chess/types';
import { getLegalMoves } from '../../../lib/chess/engine';
import { Question } from '../../../types';
import { TriangleAlert, Trophy } from 'lucide-react';

interface ChessQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

// Helper pour convertir FEN vers le format SquareData[] du moteur personnalisé
const parseFenToBoard = (fen: string): SquareData[] => {
  const board: SquareData[] = [];
  const parts = fen.split(' ');
  const placement = parts[0];
  const rows = placement.split('/');
  
  const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  // Initialiser un plateau vide 8x8
  let fenRowIndex = 0;
  
  for (let r = 0; r < 8; r++) {
    let c = 0;
    const fenRow = rows[fenRowIndex];
    let fenCharIndex = 0;

    // Traiter la ligne FEN
    while (c < 8 && fenCharIndex < fenRow.length) {
      const char = fenRow[fenCharIndex];
      
      if (/\d/.test(char)) {
        // C'est un chiffre (cases vides)
        const emptyCount = parseInt(char);
        for (let k = 0; k < emptyCount; k++) {
           const id = `${COLS[c]}${8-r}`;
           const isDark = (r + c) % 2 === 1;
           board.push({ id, row: r, col: c, color: isDark ? 'dark' : 'light', piece: null });
           c++;
        }
      } else {
        // C'est une pièce
        const color: PieceColor = char === char.toUpperCase() ? 'white' : 'black';
        const typeMap: Record<string, PieceType> = {
          'k': 'king', 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight', 'p': 'pawn'
        };
        const type = typeMap[char.toLowerCase()];
        
        const id = `${COLS[c]}${8-r}`;
        const isDark = (r + c) % 2 === 1;
        
        board.push({ 
            id, row: r, col: c, 
            color: isDark ? 'dark' : 'light', 
            piece: { type, color, symbol: '' } 
        });
        c++;
      }
      fenCharIndex++;
    }
    fenRowIndex++;
  }
  return board;
};

export const ChessQuestion: React.FC<ChessQuestionProps> = ({ question, onAnswer }) => {
  // Initialiser le plateau depuis le FEN de la question ou vide par défaut
  const [board, setBoard] = useState<SquareData[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<SquareData | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [wrongMoveId, setWrongMoveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const MAX_ATTEMPTS = 2;

  // Charger le FEN au montage ou changement de question
  useEffect(() => {
    if (question.fen) {
      setBoard(parseFenToBoard(question.fen));
    }
    // Reset states
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setWrongMoveId(null);
    setAttempts(0);
    setIsLocked(false);
    setMessage(null);
  }, [question.id, question.fen]);

  // Calculer les coups légaux quand une pièce est sélectionnée
  useEffect(() => {
    if (selectedSquare && selectedSquare.piece) {
      const moves = getLegalMoves(board, selectedSquare.piece, selectedSquare.id);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [selectedSquare, board]);

  const handleSquareClick = (clickedSquare: SquareData) => {
    if (isLocked || wrongMoveId) return;

    // Si aucune pièce sélectionnée, on sélectionne (si c'est une pièce blanche)
    if (!selectedSquare) {
      if (clickedSquare.piece && clickedSquare.piece.color === 'white') {
        setSelectedSquare(clickedSquare);
      }
      return;
    }

    // Si on clique sur la même case, on désélectionne
    if (clickedSquare.id === selectedSquare.id) {
        setSelectedSquare(null);
        return;
    }

    // Si on clique sur une autre pièce blanche, on change la sélection
    if (clickedSquare.piece && clickedSquare.piece.color === 'white') {
        setSelectedSquare(clickedSquare);
        return;
    }

    // Sinon, on tente le mouvement
    attemptMove(selectedSquare, clickedSquare);
  };

  const handlePieceDragStart = (square: SquareData) => {
    if (isLocked || wrongMoveId) return;
    if (square.piece && square.piece.color === 'white') setSelectedSquare(square);
  };

  const handlePieceDrop = (sourceId: string, targetId: string) => {
    if (isLocked || wrongMoveId) return;
    const sourceSquare = board.find(sq => sq.id === sourceId);
    const targetSquare = board.find(sq => sq.id === targetId);

    if (sourceSquare && targetSquare && sourceSquare.piece && sourceSquare.piece.color === 'white') {
       const moves = getLegalMoves(board, sourceSquare.piece, sourceId);
       if (moves.includes(targetId)) {
          attemptMove(sourceSquare, targetSquare);
       } else {
          setSelectedSquare(sourceSquare);
       }
    }
  };

  const attemptMove = (fromSquare: SquareData, toSquare: SquareData) => {
      // Vérifier si le coup est dans la liste des coups valides calculés
      if (!validMoves.includes(toSquare.id)) {
          setSelectedSquare(null);
          return;
      }

      // Exécuter le mouvement visuellement
      const newBoard = board.map(sq => {
        if (sq.id === fromSquare.id) return { ...sq, piece: null };
        if (sq.id === toSquare.id) return { ...sq, piece: fromSquare.piece };
        return sq;
      });

      setBoard(newBoard);
      setLastMove({ from: fromSquare.id, to: toSquare.id });
      setSelectedSquare(null);

      // --- Validation de la réponse ---
      // Le moteur renvoie des IDs comme "E2" et "E4".
      const playedMoveStr = `${fromSquare.id}-${toSquare.id}`;
      
      // La question attend une réponse au format "FROM-TO"
      const isCorrect = playedMoveStr === question.correctAnswer;

      if (isCorrect) {
          setMessage({ text: "Mat ! Bien joué.", type: 'success' });
          setIsLocked(true);
          // On attend un peu pour que l'utilisateur voit "Mat" avant de passer
          setTimeout(() => onAnswer(true), 1200);
      } else {
          // Mauvaise réponse
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setWrongMoveId(toSquare.id);

          if (newAttempts >= MAX_ATTEMPTS) {
              setMessage({ text: "Échec. Vous avez utilisé tous vos essais.", type: 'error' });
              setIsLocked(true);
              setTimeout(() => onAnswer(false), 2000);
          } else {
              setMessage({ text: "Mauvais coup. Réessayez.", type: 'error' });
              // Reset board after delay
              setTimeout(() => {
                if (question.fen) setBoard(parseFenToBoard(question.fen));
                setLastMove(null);
                setWrongMoveId(null);
                setMessage(null);
              }, 1000);
          }
      }
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-[400px] mx-auto relative select-none">
        {/* Game Area */}
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
            
            {/* Overlay Feedback */}
            {message && (
              <div className={`absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in`}>
                  <div className={`bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center transform scale-110 animate-in zoom-in-90 duration-200 border-4 ${message.type === 'success' ? 'border-[#81b64c]' : 'border-[#fa412d]'}`}>
                      {message.type === 'success' ? (
                          <Trophy size={48} className="text-[#81b64c] mb-2 fill-current" />
                      ) : (
                          <TriangleAlert size={48} className="text-[#fa412d] mb-2 fill-current" />
                      )}
                      <span className={`text-xl font-black uppercase tracking-wider ${message.type === 'success' ? 'text-[#81b64c]' : 'text-[#fa412d]'}`}>
                          {message.type === 'success' ? 'Victoire !' : 'Raté'}
                      </span>
                      <p className="text-slate-600 font-bold text-sm mt-1">{message.text}</p>
                  </div>
              </div>
            )}
        </div>

        {/* Status Bar (Mistakes Allowed) */}
        <div className="w-full mt-4 bg-[#302e2b] p-3 rounded-lg border border-[#3d3a36] shadow-sm">
          <div className="flex justify-between text-[10px] font-bold uppercase text-[#9a9996] mb-1.5 tracking-wider">
              <span>Essais autorisés</span>
              <span className={attempts > 0 ? 'text-[#fa412d]' : 'text-[#81b64c]'}>
                  {MAX_ATTEMPTS - attempts} restants
              </span>
          </div>
          <div className="flex gap-1 h-2">
              {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <div 
                      key={i} 
                      className={`flex-1 rounded-[2px] transition-colors duration-300 ${i < (MAX_ATTEMPTS - attempts) ? 'bg-[#81b64c]' : 'bg-[#fa412d]'}`} 
                  />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
