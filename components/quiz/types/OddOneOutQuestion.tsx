"use client";

import React, { useState } from 'react';
import { Question } from '../../../types';
import { AlertTriangle } from 'lucide-react';

interface OddOneOutQuestionProps {
  question: Question;
  onAnswer: (itemId: string) => void;
}

export const OddOneOutQuestion: React.FC<OddOneOutQuestionProps> = ({ question, onAnswer }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
      setSelectedId(id);
      onAnswer(id);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-6 flex items-center justify-center gap-2 text-slate-500 font-bold">
            <AlertTriangle size={20} /> Trouvez l'intrus !
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {question.oddOneOutItems?.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-3 active:scale-95 ${
                        selectedId === item.id
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200'
                        : 'border-slate-100 bg-white hover:border-red-200 hover:shadow-lg'
                    }`}
                >
                    {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-24 h-24 object-contain" alt={item.content} />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">?</div>
                    )}
                    <span className="font-bold text-slate-700">{item.content}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
