"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../../types';
import { Delete, CornerDownLeft } from 'lucide-react';

interface WordGuessQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const WordGuessQuestion: React.FC<WordGuessQuestionProps> = ({ question, onAnswer }) => {
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeRow, setShakeRow] = useState<number | null>(null);

  const MAX_ATTEMPTS = 6;
  const WORD_LENGTH = question.wordLength || 5;
  const TARGET_WORD = (question.correctAnswer as string).toUpperCase();

  useEffect(() => {
    // Reset
    setCurrentGuess("");
    setGuesses([]);
    setGameStatus('playing');
    setShakeRow(null);
  }, [question.id]);

  const handleKey = (key: string) => {
      if (gameStatus !== 'playing') return;

      if (key === 'ENTER') {
          if (currentGuess.length !== WORD_LENGTH) {
              // Shake animation if not enough letters
              setShakeRow(guesses.length);
              setTimeout(() => setShakeRow(null), 500);
              return;
          }
          
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");

          if (currentGuess === TARGET_WORD) {
              setGameStatus('won');
              onAnswer(currentGuess);
          } else if (newGuesses.length >= MAX_ATTEMPTS) {
              setGameStatus('lost');
              // Auto fail
              onAnswer(currentGuess); 
          }
          return;
      }

      if (key === 'BACKSPACE') {
          setCurrentGuess(prev => prev.slice(0, -1));
          return;
      }

      if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
          setCurrentGuess(prev => prev + key);
      }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') handleKey('ENTER');
        else if (e.key === 'Backspace') handleKey('BACKSPACE');
        else {
            const char = e.key.toUpperCase();
            if (/^[A-Z]$/.test(char)) handleKey(char);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, gameStatus]);

  const getCharStatus = (char: string, index: number) => {
      if (TARGET_WORD[index] === char) return 'correct';
      if (TARGET_WORD.includes(char)) return 'present';
      return 'absent';
  };

  const getRowClass = (rowIndex: number) => {
      if (rowIndex === shakeRow) return "animate-shake";
      return "";
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center select-none">
        <style>{`
          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }
          .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
          .animate-pop { animation: pop 0.1s ease-in-out; }
          @keyframes pop { 50% { transform: scale(1.1); } }
        `}</style>

        <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
            {/* Grid */}
            <div className="grid gap-2 mb-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                {[...Array(MAX_ATTEMPTS)].map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === guesses.length;
                    const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : "");
                    
                    return (
                        <div key={rowIndex} className={`grid gap-2 ${getRowClass(rowIndex)}`} style={{ gridTemplateColumns: `repeat(${WORD_LENGTH}, minmax(0, 1fr))` }}>
                            {[...Array(WORD_LENGTH)].map((_, colIndex) => {
                                const char = guess[colIndex] || "";
                                let statusClass = "bg-white border-2 border-slate-200 text-slate-800";
                                let animationDelay = "0ms";
                                
                                if (!isCurrentRow && guesses[rowIndex]) {
                                    const status = getCharStatus(char, colIndex);
                                    if (status === 'correct') statusClass = "bg-[#6aaa64] border-[#6aaa64] text-white";
                                    else if (status === 'present') statusClass = "bg-[#c9b458] border-[#c9b458] text-white";
                                    else statusClass = "bg-[#787c7e] border-[#787c7e] text-white";
                                    animationDelay = `${colIndex * 100}ms`;
                                } else if (char) {
                                    statusClass = "border-slate-400 text-slate-800 animate-pop border-b-4";
                                }

                                return (
                                    <div 
                                        key={colIndex} 
                                        className={`aspect-square flex items-center justify-center font-black text-2xl sm:text-3xl rounded-lg transition-all duration-500 transform ${statusClass}`}
                                        style={{ transitionDelay: animationDelay }}
                                    >
                                        {char}
                                    </div>
                                );
                            })}
                        </div>
                    )
                })}
            </div>

            {/* Virtual Keyboard */}
            <div className="grid gap-2 w-full px-1">
                {[
                    ['A','Z','E','R','T','Y','U','I','O','P'],
                    ['Q','S','D','F','G','H','J','K','L','M'],
                    ['W','X','C','V','B','N']
                ].map((row, i) => (
                    <div key={i} className="flex justify-center gap-1.5">
                        {row.map(char => {
                            // Determine key color based on history
                            let keyColor = "bg-slate-200 text-slate-700 hover:bg-slate-300";
                            let bestStatus = 'unknown';

                            for (const g of guesses) {
                                for (let j=0; j<g.length; j++) {
                                    if (g[j] === char) {
                                        const status = getCharStatus(char, j);
                                        if (status === 'correct') bestStatus = 'correct';
                                        else if (status === 'present' && bestStatus !== 'correct') bestStatus = 'present';
                                        else if (status === 'absent' && bestStatus === 'unknown') bestStatus = 'absent';
                                    }
                                }
                            }

                            if (bestStatus === 'correct') keyColor = "bg-[#6aaa64] text-white";
                            else if (bestStatus === 'present') keyColor = "bg-[#c9b458] text-white";
                            else if (bestStatus === 'absent') keyColor = "bg-[#787c7e] text-white";

                            return (
                                <button
                                    key={char}
                                    onClick={() => handleKey(char)}
                                    className={`h-12 flex-1 rounded-lg font-bold text-sm transition-all active:scale-95 ${keyColor}`}
                                >
                                    {char}
                                </button>
                            )
                        })}
                    </div>
                ))}
                <div className="flex justify-center gap-2 mt-2 px-4">
                     <button onClick={() => handleKey('BACKSPACE')} className="h-12 flex items-center justify-center px-6 bg-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-300 active:scale-95 flex-1">
                        <Delete size={20} />
                     </button>
                     <button onClick={() => handleKey('ENTER')} className="h-12 flex items-center justify-center px-6 bg-slate-800 rounded-lg text-white font-bold hover:bg-slate-700 active:scale-95 flex-1 gap-2">
                        ENTRÉE <CornerDownLeft size={16} />
                     </button>
                </div>
            </div>
        </div>
    </div>
  );
};
