
import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../../../types';
import { Target, MapPin } from 'lucide-react';

interface HotspotQuestionProps {
  question: Question;
  onAnswer: (coords: { x: number; y: number } | null) => void;
}

export const HotspotQuestion: React.FC<HotspotQuestionProps> = ({ question, onAnswer }) => {
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMarker(null);
    onAnswer(null);
  }, [question.id]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker = { x, y };
    setMarker(newMarker);
    onAnswer(newMarker);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4 flex items-center gap-2">
          <Target size={16} />
          Cliquez sur l'image pour placer votre réponse
        </div>

        <div 
          className="relative inline-block rounded-2xl overflow-hidden shadow-lg border-4 border-slate-100 cursor-crosshair group bg-slate-100"
          onClick={handleClick}
        >
          <img 
              ref={imageRef}
              src={question.imageUrl} 
              alt="Hotspot Target" 
              className="w-full h-auto max-h-[400px] object-contain block"
              draggable={false}
          />
          
          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />

          {/* Marker */}
          {marker && (
              <div 
                  className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                  <MapPin size={48} className="text-red-600 fill-red-600 drop-shadow-lg animate-in zoom-in-0 duration-300" />
                  <div className="w-3 h-3 bg-black/30 rounded-full blur-[2px] mx-auto -mt-2"></div>
              </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-slate-400 font-medium">
           Précision requise : {question.hotspotTarget?.tolerance || 10}%
        </div>
      </div>
    </div>
  );
};
