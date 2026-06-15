
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';

interface AnagramQuestionProps {
  question: Question;
  onAnswer: (word: string) => void;
}

interface Tile {
  id: string;
  char: string;
  status: 'bank' | 'placed';
}

export const AnagramQuestion: React.FC<AnagramQuestionProps> = ({ question, onAnswer }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<(Tile | null)[]>([]);

  useEffect(() => {
    if (question.anagramWord) {
      const word = question.anagramWord.toUpperCase().replace(/\s/g, '');
      const chars = word.split('');
      // Shuffle
      const shuffled = chars.map((c, i) => ({
          id: `tile-${i}-${c}`,
          char: c,
          status: 'bank' as const
      })).sort(() => Math.random() - 0.5);

      setTiles(shuffled);
      setPlacedTiles(new Array(chars.length).fill(null));
    }
  }, [question.id]);

  useEffect(() => {
      // Form answer from placed tiles
      const currentWord = placedTiles.map(t => t ? t.char : '').join('');
      // Send partial or full answer for checking
      if (placedTiles.every(t => t !== null)) {
        onAnswer(currentWord);
      }
  }, [placedTiles]);

  const handleBankClick = (tileId: string) => {
    // Move from bank to first empty slot
    const tileIndex = tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1 || tiles[tileIndex].status === 'placed') return;

    const firstEmptyIndex = placedTiles.findIndex(t => t === null);
    if (firstEmptyIndex !== -1) {
        const newTiles = [...tiles];
        newTiles[tileIndex].status = 'placed';
        setTiles(newTiles);

        const newPlaced = [...placedTiles];
        newPlaced[firstEmptyIndex] = newTiles[tileIndex];
        setPlacedTiles(newPlaced);
    }
  };

  const handleSlotClick = (index: number) => {
    // Move from slot back to bank
    const tile = placedTiles[index];
    if (!tile) return;

    const tileIndex = tiles.findIndex(t => t.id === tile.id);
    if (tileIndex !== -1) {
        const newTiles = [...tiles];
        newTiles[tileIndex].status = 'bank';
        setTiles(newTiles);

        const newPlaced = [...placedTiles];
        newPlaced[index] = null;
        setPlacedTiles(newPlaced);
    }
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-10 py-4 select-none">
        
        {/* Target Slots */}
        <div className="flex gap-2 flex-wrap justify-center min-h-[64px]">
          {placedTiles.map((tile, idx) => (
              <button
                  key={`slot-${idx}`}
                  onClick={() => handleSlotClick(idx)}
                  className={`w-12 h-14 md:w-14 md:h-16 rounded-xl border-b-4 text-2xl font-black flex items-center justify-center transition-all ${
                      tile 
                      ? 'bg-blue-500 border-blue-700 text-white shadow-lg active:translate-y-1 active:border-b-0' 
                      : 'bg-slate-100 border-slate-200 border-dashed text-slate-300'
                  }`}
              >
                  {tile ? tile.char : ''}
              </button>
          ))}
        </div>

        {/* Letter Bank */}
        <div className="flex gap-2 flex-wrap justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
            {tiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleBankClick(tile.id)}
                  disabled={tile.status === 'placed'}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl font-black text-xl flex items-center justify-center transition-all duration-200 ${
                      tile.status === 'placed' 
                      ? 'bg-slate-200 text-transparent opacity-0 scale-75' 
                      : 'bg-white border-2 border-slate-200 text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-600 hover:-translate-y-1 active:scale-95'
                  }`}
                >
                    {tile.char}
                </button>
            ))}
        </div>

        <div className="text-slate-400 text-sm font-medium">
            Reconstituez le mot caché.
        </div>
      </div>
    </div>
  );
};
