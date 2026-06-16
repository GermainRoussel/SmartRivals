"use client";

import React, { useEffect, useRef, useState } from "react";
import { Question } from "../../../types";
import { Play, Pause, Volume2 } from "lucide-react";
import { playSound, type SoundId, type SoundHandle } from "@/lib/audio";

interface BlindTestQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const BlindTestQuestion: React.FC<BlindTestQuestionProps> = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const handleRef = useRef<SoundHandle | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setIsPlaying(false);
    return () => handleRef.current?.stop();
  }, [question.id]);

  const togglePlay = () => {
    if (isPlaying) {
      handleRef.current?.stop();
      handleRef.current = null;
      setIsPlaying(false);
      return;
    }
    if (!question.soundId) return;
    setIsPlaying(true);
    handleRef.current = playSound(question.soundId as SoundId, () => {
      setIsPlaying(false);
      handleRef.current = null;
    });
  };

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onAnswer(option);
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto">
      {/* Visual Player */}
      <div className="w-full bg-slate-900 rounded-3xl p-8 mb-8 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
        {/* Decorative background waves */}
        <div className="absolute inset-0 opacity-20 flex items-center justify-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`w-2 bg-blue-500 rounded-full ${isPlaying ? "animate-pulse" : "h-4"}`}
              style={{
                height: isPlaying ? `${30 + ((i * 37) % 70)}%` : "10%",
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <button
          onClick={togglePlay}
          className="w-20 h-20 bg-white hover:bg-blue-50 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg z-10"
        >
          {isPlaying ? (
            <Pause size={32} className="text-slate-900" fill="currentColor" />
          ) : (
            <Play size={32} className="text-slate-900 ml-1" fill="currentColor" />
          )}
        </button>
        <div className="mt-4 text-blue-200 font-bold text-sm tracking-widest flex items-center gap-2">
          <Volume2 size={16} /> {isPlaying ? "LECTURE EN COURS..." : "ÉCOUTER LE SON"}
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
                ? "bg-blue-500 border-blue-600 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
