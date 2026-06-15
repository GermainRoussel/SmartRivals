
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';
import { ArrowLeft, ArrowRight, Check, Layers } from 'lucide-react';

interface SortingQuestionProps {
  question: Question;
  onSortComplete: (results: Record<string, string>) => void;
}

export const SortingQuestion: React.FC<SortingQuestionProps> = ({ question, onSortComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, string>>({});
  const [animatingDir, setAnimatingDir] = useState<'left' | 'right' | null>(null);
  const [items, setItems] = useState(question.sortingItems || []);

  useEffect(() => {
    // Reset state when question changes
    setItems(question.sortingItems || []);
    setCurrentIndex(0);
    setResults({});
    setAnimatingDir(null);
  }, [question.id]);

  useEffect(() => {
    // If we reached the end, submit answers
    if (items.length > 0 && currentIndex >= items.length) {
      onSortComplete(results);
    }
  }, [currentIndex, items.length, onSortComplete, results]);

  const handleSort = (groupId: string, direction: 'left' | 'right') => {
    if (currentIndex >= items.length) return;

    const currentItem = items[currentIndex];
    setAnimatingDir(direction);

    // Wait for animation
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        [currentItem.id]: groupId
      }));
      setAnimatingDir(null);
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };

  if (!question.groups || question.groups.length < 2 || items.length === 0) {
    return <div>Configuration invalide pour le tri.</div>;
  }

  const groupA = question.groups[0];
  const groupB = question.groups[1];
  const currentItem = items[currentIndex];
  const isFinished = currentIndex >= items.length;

  // Calculate progress
  const progress = (currentIndex / items.length) * 100;

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto select-none">
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="relative h-[300px] mb-8">
          {/* Empty State / Done */}
          {isFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="text-slate-400 font-bold flex flex-col items-center">
                  <Check size={48} className="mb-2 text-green-500" />
                  Tri terminé !
              </div>
            </div>
          )}

          {/* Card Stack Effect (Background cards) */}
          {!isFinished && currentIndex + 1 < items.length && (
            <div className="absolute top-4 left-0 right-0 mx-auto w-[90%] h-full bg-white border border-slate-100 rounded-3xl shadow-sm z-0"></div>
          )}
          {!isFinished && currentIndex + 2 < items.length && (
            <div className="absolute top-8 left-0 right-0 mx-auto w-[80%] h-full bg-white border border-slate-50 rounded-3xl shadow-sm -z-10"></div>
          )}

          {/* Active Card */}
          {!isFinished && currentItem && (
            <div 
              className={`absolute inset-0 bg-white rounded-3xl shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center p-6 text-center z-10 transition-transform duration-200 ${
                  animatingDir === 'left' ? '-translate-x-32 -rotate-12 opacity-0' : 
                  animatingDir === 'right' ? 'translate-x-32 rotate-12 opacity-0' : ''
              }`}
            >
              {currentItem.imageUrl ? (
                  <img src={currentItem.imageUrl} alt={currentItem.content} className="w-32 h-32 object-contain mb-4 rounded-lg" />
              ) : (
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                      <Layers size={40} />
                  </div>
              )}
              <h3 className="text-2xl font-black text-slate-800 leading-tight">
                  {currentItem.content}
              </h3>
              <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Élément {currentIndex + 1} / {items.length}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
              onClick={() => handleSort(groupA.id, 'left')}
              disabled={isFinished}
              className={`p-6 rounded-2xl border-b-4 transition-all flex flex-col items-center gap-2 group ${
                  isFinished ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' : 
                  'bg-white border-slate-200 hover:border-red-400 hover:bg-red-50 hover:shadow-lg active:scale-95'
              }`}
          >
              <ArrowLeft className={`transition-colors ${isFinished ? 'text-slate-400' : 'text-slate-400 group-hover:text-red-500'}`} size={32} />
              <span className={`font-black text-lg ${isFinished ? 'text-slate-400' : 'text-slate-700 group-hover:text-red-700'}`}>
                  {groupA.label}
              </span>
          </button>

          <button
              onClick={() => handleSort(groupB.id, 'right')}
              disabled={isFinished}
              className={`p-6 rounded-2xl border-b-4 transition-all flex flex-col items-center gap-2 group ${
                  isFinished ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' : 
                  'bg-white border-slate-200 hover:border-green-400 hover:bg-green-50 hover:shadow-lg active:scale-95'
              }`}
          >
              <ArrowRight className={`transition-colors ${isFinished ? 'text-slate-400' : 'text-slate-400 group-hover:text-green-500'}`} size={32} />
              <span className={`font-black text-lg ${isFinished ? 'text-slate-400' : 'text-slate-700 group-hover:text-green-700'}`}>
                  {groupB.label}
              </span>
          </button>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm font-medium">
          Ou utilisez les flèches ← → du clavier
        </div>
      </div>
    </div>
  );
};
