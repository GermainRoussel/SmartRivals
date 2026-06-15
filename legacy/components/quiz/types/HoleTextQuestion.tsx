
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';
import { Eraser } from 'lucide-react';

interface HoleTextQuestionProps {
  question: Question;
  onAnswer: (answers: string[]) => void;
}

interface TextSegment {
  id: string;
  text: string;
  isHole: boolean;
  expected?: string;
}

export const HoleTextQuestion: React.FC<HoleTextQuestionProps> = ({ question, onAnswer }) => {
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // map segmentId -> word
  
  useEffect(() => {
    if (!question.holeText) return;

    // Parse text: "Hello {world} today." -> ["Hello ", "{world}", " today."]
    const regex = /({[^}]+})/g;
    const rawParts = question.holeText.split(regex);
    
    const newSegments: TextSegment[] = [];
    const bank: string[] = [];

    rawParts.forEach((part, index) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            const word = part.slice(1, -1);
            bank.push(word);
            newSegments.push({
                id: `hole-${index}`,
                text: "",
                isHole: true,
                expected: word
            });
        } else if (part.length > 0) {
            newSegments.push({
                id: `text-${index}`,
                text: part,
                isHole: false
            });
        }
    });

    setSegments(newSegments);
    // Shuffle word bank
    setWordBank([...bank].sort(() => Math.random() - 0.5));
    setUserAnswers({});
  }, [question.id]);

  useEffect(() => {
      // Reconstruct the ordered list of answers for validation
      // Filter segments to only get holes, map to user answer or ""
      const holes = segments.filter(s => s.isHole);
      const answerArray = holes.map(h => userAnswers[h.id] || "");
      onAnswer(answerArray);
  }, [userAnswers, segments]);

  const handleWordClick = (word: string) => {
    // Find first empty hole
    const firstEmpty = segments.find(s => s.isHole && !userAnswers[s.id]);
    if (firstEmpty) {
        setUserAnswers(prev => ({
            ...prev,
            [firstEmpty.id]: word
        }));
    }
  };

  const handleHoleClick = (segmentId: string) => {
      // Clear the hole
      setUserAnswers(prev => {
          const next = { ...prev };
          delete next[segmentId];
          return next;
      });
  };

  const resetAll = () => {
      setUserAnswers({});
  };

  const getAvailableBank = () => {
      const usedWords = Object.values(userAnswers);
      const available = [...wordBank];
      usedWords.forEach(word => {
          const idx = available.indexOf(word);
          if (idx > -1) available.splice(idx, 1);
      });
      return available;
  };

  const availableWords = getAvailableBank();

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* Text Area */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 leading-loose text-lg md:text-xl text-slate-700 font-medium text-center">
          {segments.map((seg) => {
              if (!seg.isHole) {
                  return <span key={seg.id} className="whitespace-pre-wrap">{seg.text}</span>;
              }
              
              const filledWord = userAnswers[seg.id];
              
              return (
                  <span 
                      key={seg.id}
                      onClick={() => filledWord ? handleHoleClick(seg.id) : null}
                      className={`inline-block min-w-[80px] h-10 mx-1 px-3 py-1 rounded-xl border-b-4 transition-all align-middle text-center cursor-pointer select-none ${
                          filledWord 
                          ? 'bg-blue-100 border-blue-400 text-blue-700 font-bold hover:bg-red-100 hover:border-red-400 hover:text-red-700' 
                          : 'bg-slate-100 border-slate-200 animate-pulse'
                      }`}
                  >
                      {filledWord || ""}
                  </span>
              );
          })}
        </div>

        {/* Word Bank */}
        <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Mots disponibles
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                {availableWords.map((word, idx) => (
                    <button
                      key={`${word}-${idx}`}
                      onClick={() => handleWordClick(word)}
                      className="px-4 py-2 bg-white border-2 border-slate-200 shadow-sm rounded-xl font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        {word}
                    </button>
                ))}
                {availableWords.length === 0 && (
                    <div className="text-slate-300 italic">Tous les mots sont placés</div>
                )}
            </div>
        </div>

        {/* Reset Action */}
        <div className="flex justify-center">
          <button 
              onClick={resetAll}
              disabled={Object.keys(userAnswers).length === 0}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
              <Eraser size={16} /> Effacer tout
          </button>
        </div>
      </div>
    </div>
  );
};
