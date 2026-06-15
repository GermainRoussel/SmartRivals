
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../../types';
import { Play } from 'lucide-react';

interface SimonQuestionProps {
  question: Question;
  onAnswer: (sequence: string[]) => void;
}

const COLORS = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400'
};

const HOVER_COLORS = {
    red: 'hover:bg-red-400',
    blue: 'hover:bg-blue-400',
    green: 'hover:bg-green-400',
    yellow: 'hover:bg-yellow-300'
};

export const SimonQuestion: React.FC<SimonQuestionProps> = ({ question, onAnswer }) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'user'>('idle');
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const sequence = question.simonSequence || ['red', 'blue', 'green', 'yellow'];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset on new question
    setPhase('idle');
    setUserSequence([]);
    setActiveColor(null);
  }, [question.id]);

  const playSequence = () => {
      setPhase('playing');
      setUserSequence([]);
      
      let i = 0;
      const playNext = () => {
          if (i >= sequence.length) {
              setPhase('user');
              setActiveColor(null);
              return;
          }
          
          // Flash color
          setActiveColor(sequence[i]);
          
          // Turn off after 500ms
          setTimeout(() => {
              setActiveColor(null);
              i++;
              // Wait 200ms before next
              setTimeout(playNext, 200);
          }, 600);
      };

      // Start delay
      setTimeout(playNext, 500);
  };

  const handleBtnClick = (color: string) => {
      if (phase !== 'user') return;

      // Flash on click
      setActiveColor(color);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setActiveColor(null), 200);

      const newSeq = [...userSequence, color];
      setUserSequence(newSeq);
      
      // Auto-submit if full length reached
      if (newSeq.length === sequence.length) {
          onAnswer(newSeq);
      }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="mb-8 text-center h-8">
            {phase === 'idle' && (
                <button 
                    onClick={playSequence}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                    <Play size={16} fill="currentColor" /> Lancer la séquence
                </button>
            )}
            {phase === 'playing' && <span className="text-blue-500 font-bold animate-pulse">Mémorisez...</span>}
            {phase === 'user' && <span className="text-green-600 font-bold">À vous ! Répétez.</span>}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full aspect-square p-4 bg-slate-100 rounded-full border-4 border-slate-200">
            {['red', 'blue', 'green', 'yellow'].map((color) => {
                const isActive = activeColor === color;
                // @ts-ignore
                const bgClass = isActive ? 'brightness-125 scale-95 shadow-inner ring-4 ring-white' : `${COLORS[color]} ${phase === 'user' ? HOVER_COLORS[color] : 'opacity-80'}`;
                
                return (
                    <button
                        key={color}
                        onClick={() => handleBtnClick(color)}
                        disabled={phase !== 'user'}
                        className={`w-full h-full rounded-2xl transition-all duration-100 ${bgClass} shadow-lg`}
                    ></button>
                )
            })}
        </div>
        
        {phase === 'user' && (
            <div className="flex gap-2 mt-6">
                {userSequence.map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-slate-800"></div>
                ))}
                {[...Array(sequence.length - userSequence.length)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-slate-300"></div>
                ))}
            </div>
        )}
    </div>
  );
};
