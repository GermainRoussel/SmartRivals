
import React, { useState } from 'react';
import { Question } from '../../../types';
import { Check, X } from 'lucide-react';

interface TrueFalseQuestionProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (val: boolean) => {
      setSelected(val);
      onAnswer(val);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="grid grid-cols-2 gap-6 md:gap-12">
            {/* VRAI BUTTON */}
            <button
              onClick={() => handleSelect(true)}
              className={`aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all shadow-xl border-b-8 active:border-b-0 active:translate-y-2 group ${
                  selected === true 
                  ? 'bg-green-500 border-green-700 ring-4 ring-green-200 scale-105' 
                  : 'bg-white border-green-100 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors ${selected === true ? 'bg-white text-green-500' : 'bg-green-100 text-green-500 group-hover:bg-green-500 group-hover:text-white'}`}>
                  <Check size={48} strokeWidth={4} />
              </div>
              <span className={`text-2xl md:text-4xl font-black uppercase tracking-wider ${selected === true ? 'text-white' : 'text-green-500'}`}>
                  Vrai
              </span>
            </button>

            {/* FAUX BUTTON */}
            <button
              onClick={() => handleSelect(false)}
              className={`aspect-square rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all shadow-xl border-b-8 active:border-b-0 active:translate-y-2 group ${
                  selected === false 
                  ? 'bg-red-500 border-red-700 ring-4 ring-red-200 scale-105' 
                  : 'bg-white border-red-100 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors ${selected === false ? 'bg-white text-red-500' : 'bg-red-100 text-red-500 group-hover:bg-red-500 group-hover:text-white'}`}>
                  <X size={48} strokeWidth={4} />
              </div>
              <span className={`text-2xl md:text-4xl font-black uppercase tracking-wider ${selected === false ? 'text-white' : 'text-red-500'}`}>
                  Faux
              </span>
            </button>
        </div>
      </div>
    </div>
  );
};
