
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';
import { Eye, Clock } from 'lucide-react';

interface PixelRevealQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const PixelRevealQuestion: React.FC<PixelRevealQuestionProps> = ({ question, onAnswer }) => {
  const [hiddenBlocks, setHiddenBlocks] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const TOTAL_BLOCKS = 64; // 8x8 grid

  useEffect(() => {
    // Initialize with all blocks present (0 to 63)
    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    setHiddenBlocks(blocks);
    setInputValue("");
    
    // Reveal blocks randomly
    const interval = setInterval(() => {
      setHiddenBlocks(prev => {
        if (prev.length <= 0) {
            clearInterval(interval);
            return [];
        }
        // Remove 2 blocks at a time for speed
        const newBlocks = [...prev];
        if (newBlocks.length > 0) newBlocks.splice(Math.floor(Math.random() * newBlocks.length), 1);
        if (newBlocks.length > 0) newBlocks.splice(Math.floor(Math.random() * newBlocks.length), 1);
        return newBlocks;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [question.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      onAnswer(val);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto">
        <div className="mb-4 text-sm font-bold text-slate-400 flex items-center gap-2">
            <Clock size={16} /> L'image se dévoile...
        </div>

        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 mb-8">
            <img 
                src={question.pixelImage || question.imageUrl} 
                className="w-full h-full object-cover absolute inset-0"
                alt="Pixel Reveal"
            />
            
            {/* Mosaic Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`bg-slate-200 border border-slate-300 transition-opacity duration-500 ${hiddenBlocks.includes(i) ? 'opacity-100' : 'opacity-0'}`}
                    ></div>
                ))}
            </div>

            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1 z-10">
                <Eye size={12} /> {Math.round(((TOTAL_BLOCKS - hiddenBlocks.length) / TOTAL_BLOCKS) * 100)}%
            </div>
        </div>

        <input 
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Qu'est-ce que c'est ?"
            className="w-full p-5 text-2xl font-bold text-center rounded-2xl border-4 border-slate-200 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-300 text-slate-700"
            autoFocus
        />
    </div>
  );
};
