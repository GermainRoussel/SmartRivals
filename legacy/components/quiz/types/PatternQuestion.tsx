
import React, { useState } from 'react';
import { Question } from '../../../types';
import { LayoutGrid, HelpCircle } from 'lucide-react';

interface PatternQuestionProps {
  question: Question;
  onAnswer: (optionId: string) => void;
}

export const PatternQuestion: React.FC<PatternQuestionProps> = ({ question, onAnswer }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onAnswer(id);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 items-center">
            
            {/* Main Pattern Image */}
            <div className="relative bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 w-full flex items-center justify-center min-h-[200px]">
                <div className="absolute top-4 left-4 flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                <img 
                    src={question.patternGridImage} 
                    alt="Pattern Grid" 
                    className="w-full max-w-sm h-auto object-contain rounded-lg"
                />
                
                <div className="absolute -bottom-5 right-8 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 border-4 border-white">
                    <HelpCircle size={18} strokeWidth={3} />
                    Complétez
                </div>
            </div>

            {/* Options Grid */}
            <div className="w-full">
                <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Choisissez la pièce manquante</div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 w-full">
                    {question.patternOptions?.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg active:scale-95 bg-white relative group ${
                                selectedId === opt.id 
                                ? 'border-blue-500 ring-4 ring-blue-100 scale-105 z-10 shadow-xl' 
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                        >
                            <img src={opt.imageUrl} className="w-full h-full object-contain p-2" alt="Option" />
                            <div className={`absolute top-1 left-2 text-[10px] font-bold ${selectedId === opt.id ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                {opt.id}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
