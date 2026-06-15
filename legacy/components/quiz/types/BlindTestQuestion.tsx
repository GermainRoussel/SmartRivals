
import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../../../types';
import { Play, Pause, Volume2 } from 'lucide-react';

interface BlindTestQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const BlindTestQuestion: React.FC<BlindTestQuestionProps> = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset when question changes
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.load(); // Ensure new source is loaded
    }
    setIsPlaying(false);
    setSelectedOption(null);
    setError(false);
  }, [question.id, question.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch((e) => {
                console.error("Audio Playback Error");
                setError(true);
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => setIsPlaying(false);

  const handleSelect = (option: string) => {
      setSelectedOption(option);
      onAnswer(option);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto">
      {/* Hidden Audio Element */}
      {question.audioUrl && (
          <audio 
            ref={audioRef} 
            src={question.audioUrl} 
            // removed crossOrigin to prevent CORS issues with some CDNs
            onEnded={handleEnded} 
            onError={() => {
                console.error("Audio loading error for URL:", question.audioUrl);
                setError(true);
            }}
          />
      )}

      {/* Visual Player */}
      <div className="w-full bg-slate-900 rounded-3xl p-8 mb-8 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          {/* Decorative background waves */}
          <div className="absolute inset-0 opacity-20 flex items-center justify-center gap-1">
              {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-2 bg-blue-500 rounded-full ${isPlaying ? 'animate-pulse' : 'h-4'}`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '10%', animationDelay: `${i * 0.05}s` }}></div>
              ))}
          </div>

          <button 
            onClick={togglePlay}
            disabled={error}
            className={`w-20 h-20 bg-white hover:bg-blue-50 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg z-10 ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
             {isPlaying ? <Pause size={32} className="text-slate-900" fill="currentColor" /> : <Play size={32} className="text-slate-900 ml-1" fill="currentColor" />}
          </button>
          <div className="mt-4 text-blue-200 font-bold text-sm tracking-widest flex items-center gap-2">
             <Volume2 size={16} /> {error ? 'ERREUR AUDIO' : (isPlaying ? 'LECTURE EN COURS...' : 'ÉCOUTER L\'EXTRAIT')}
          </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
         {question.options?.map((opt, idx) => (
             <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-xl font-bold text-left transition-all border-2 ${
                    selectedOption === opt 
                    ? 'bg-blue-500 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                }`}
             >
                 {opt}
             </button>
         ))}
      </div>
    </div>
  );
};
