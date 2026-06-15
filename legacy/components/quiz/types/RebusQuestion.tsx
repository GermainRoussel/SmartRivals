
import React, { useState } from 'react';
import { Question } from '../../../types';
import { Smile } from 'lucide-react';

interface RebusQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const RebusQuestion: React.FC<RebusQuestionProps> = ({ question, onAnswer }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      onAnswer(val);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-[40px] shadow-lg border-4 border-blue-100 mb-8 w-full text-center">
             <div className="text-6xl md:text-8xl tracking-widest animate-in zoom-in duration-500 select-none">
                 {question.rebusEmojis}
             </div>
        </div>

        <div className="w-full relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Smile className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Que signifient ces émojis ?"
                className="w-full p-5 pl-12 text-2xl font-bold text-center rounded-2xl border-4 border-slate-200 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-300 text-slate-700 shadow-sm"
                autoFocus
            />
        </div>
    </div>
  );
};
