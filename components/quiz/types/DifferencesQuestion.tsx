
import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../../../types';
import { ScanSearch, CheckCircle2, Loader2 } from 'lucide-react';

interface DifferencesQuestionProps {
  question: Question;
  onAnswer: (coords: { x: number, y: number } | null) => void;
}

export const DifferencesQuestion: React.FC<DifferencesQuestionProps> = ({ question, onAnswer }) => {
  const [found, setFound] = useState(false);
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state on new question
  useEffect(() => {
      setFound(false);
      setClickPos(null);
      setLoading(true);
  }, [question.id]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (found || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPos({ x, y });
    
    // Check if correct locally to show immediate feedback
    const target = question.diffTarget || { x: 50, y: 50, tolerance: 10 };
    const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
    
    if (dist <= (target.tolerance || 10)) {
        setFound(true);
    }
    
    onAnswer({ x, y });
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-center">
            
            {/* Original Image */}
            <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-4 border-slate-100 bg-slate-200">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                )}
                <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-sm z-10 border border-white/20">ORIGINAL</div>
                <img 
                    src={question.diffImageLeft} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} 
                    alt="Original"
                    onLoad={() => setLoading(false)}
                />
            </div>

            {/* Difference Image (Clickable) */}
            <div 
                className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-blue-400 cursor-crosshair group bg-slate-200"
                onClick={handleClick}
            >
                 {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                )}
                 <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-sm z-10 flex gap-2 items-center border border-white/20 shadow-lg">
                    <ScanSearch size={14} /> TROUVEZ L'ERREUR
                 </div>
                 
                 <img 
                    ref={imageRef}
                    src={question.diffImageRight} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} 
                    alt="Modified" 
                    draggable={false}
                 />

                 {/* Feedback Marker */}
                 {clickPos && (
                     <div 
                        className={`absolute w-16 h-16 border-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 ${found ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-100 animate-pulse' : 'border-red-500 opacity-0 scale-50'}`}
                        style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
                     >
                        {found && <CheckCircle2 className="text-green-500 absolute -right-3 -bottom-3 bg-white rounded-full shadow-sm" size={24} fill="white" />}
                     </div>
                 )}
            </div>
        </div>
        <div className="mt-6 text-slate-400 font-bold text-sm bg-slate-50 px-4 py-2 rounded-full">
            Il y a 1 différence à trouver. Touchez l'image de droite.
        </div>
    </div>
  );
};
