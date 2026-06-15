
import React, { useState } from 'react';
import { Question } from '../../../types';
import { Calculator } from 'lucide-react';

interface MathPuzzleQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const MathPuzzleQuestion: React.FC<MathPuzzleQuestionProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<string | number | null>(null);

  const handleSelect = (val: string | number) => {
      setSelected(val);
      onAnswer(String(val));
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl mb-8 flex items-center justify-center gap-4 w-full border-b-8 border-slate-950">
              <Calculator className="text-yellow-400 opacity-50" size={32} />
              <div className="text-4xl md:text-5xl font-mono font-bold tracking-wider">
                  {question.equation}
              </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
              {question.mathGrid?.map((val, idx) => (
                  <button
                      key={idx}
                      onClick={() => handleSelect(val)}
                      className={`aspect-square rounded-2xl text-2xl font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                          selected === val 
                          ? 'bg-blue-500 border-blue-700 text-white ring-4 ring-blue-200' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300'
                      }`}
                  >
                      {val}
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};
