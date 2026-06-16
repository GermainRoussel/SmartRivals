"use client";

import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';

interface SliderQuestionProps {
  question: Question;
  onValueChange: (value: number) => void;
}

export const SliderQuestion: React.FC<SliderQuestionProps> = ({ question, onValueChange }) => {
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;
  
  // Start in the middle
  const [value, setValue] = useState<number>(Math.floor((min + max) / 2));

  useEffect(() => {
    onValueChange(value);
  }, [value, onValueChange]);

  // Reset when question changes
  useEffect(() => {
    const startValue = Math.floor((min + max) / 2);
    setValue(startValue);
    onValueChange(startValue);
  }, [question.id]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto py-8">
        {/* Value Display */}
        <div className="text-center mb-10">
          <div className="inline-block bg-slate-900 text-white text-5xl font-display font-bold px-8 py-4 rounded-2xl shadow-xl">
            {value}
            {question.unit && <span className="text-2xl text-slate-400 ml-2">{question.unit}</span>}
          </div>
        </div>

        {/* Slider */}
        <div className="relative w-full h-12 flex items-center">
          {/* Track Background */}
          <div className="absolute w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              {/* Colored Fill */}
              <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-primary transition-all duration-75"
                  style={{ width: `${percentage}%` }}
              ></div>
          </div>

          {/* Input (Invisible but functional) */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          />

          {/* Custom Thumb (Visual only, follows percentage) */}
          <div 
              className="absolute w-10 h-10 bg-white border-4 border-primary rounded-full shadow-lg z-10 pointer-events-none transition-all duration-75 flex items-center justify-center"
              style={{ left: `calc(${percentage}% - 20px)` }}
          >
              <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-4 text-slate-400 font-bold font-mono text-sm">
          <span>{min} {question.unit}</span>
          <span>{max} {question.unit}</span>
        </div>
      </div>
    </div>
  );
};
