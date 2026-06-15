
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';
import { Sparkles, Brain } from 'lucide-react';

interface MemoryQuestionProps {
  question: Question;
  onAnswer: (matchedIds: string[]) => void;
}

interface Card {
  id: string; // Unique ID for the grid position
  pairId: string; // ID to check match
  content: string;
  type: 'text' | 'image';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryQuestion: React.FC<MemoryQuestionProps> = ({ question, onAnswer }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (question.memoryPairs) {
      // Duplicate pairs to create matching cards
      let deck: Card[] = [];
      question.memoryPairs.forEach((pair, index) => {
          // Card 1
          deck.push({
              id: `pair-${index}-a`,
              pairId: pair.id,
              content: pair.content,
              type: pair.type,
              isFlipped: false,
              isMatched: false
          });
          // Card 2 (Identical for this version, or could be Pair B)
          deck.push({
              id: `pair-${index}-b`,
              pairId: pair.id,
              content: pair.content,
              type: pair.type,
              isFlipped: false,
              isMatched: false
          });
      });
      // Shuffle
      deck = deck.sort(() => Math.random() - 0.5);
      setCards(deck);
      setFlippedIds([]);
      setIsLocked(false);
    }
  }, [question.id]);

  useEffect(() => {
      // Check for completion
      const matchedCount = cards.filter(c => c.isMatched).length;
      if (cards.length > 0 && matchedCount === cards.length) {
          onAnswer(cards.map(c => c.pairId));
      }
  }, [cards]);

  const handleCardClick = (id: string) => {
      if (isLocked) return;
      const clickedCard = cards.find(c => c.id === id);
      if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

      // Flip the card
      const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
      setCards(newCards);
      
      const newFlippedIds = [...flippedIds, id];
      setFlippedIds(newFlippedIds);

      if (newFlippedIds.length === 2) {
          setIsLocked(true);
          checkForMatch(newFlippedIds, newCards);
      }
  };

  const checkForMatch = (currentFlippedIds: string[], currentCards: Card[]) => {
      const card1 = currentCards.find(c => c.id === currentFlippedIds[0]);
      const card2 = currentCards.find(c => c.id === currentFlippedIds[1]);

      if (card1 && card2 && card1.pairId === card2.pairId) {
          // Match!
          setTimeout(() => {
              setCards(prev => prev.map(c => 
                  currentFlippedIds.includes(c.id) ? { ...c, isMatched: true } : c
              ));
              setFlippedIds([]);
              setIsLocked(false);
          }, 600);
      } else {
          // No match
          setTimeout(() => {
              setCards(prev => prev.map(c => 
                  currentFlippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
              ));
              setFlippedIds([]);
              setIsLocked(false);
          }, 1000);
      }
  };

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
       <div className="grid grid-cols-4 gap-3 md:gap-4 aspect-square md:aspect-auto">
           {cards.map((card) => (
               <div 
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square relative cursor-pointer perspective-1000 group`}
               >
                   <div className={`w-full h-full transition-all duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                       
                       {/* Front (Hidden) */}
                       <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl border-b-4 border-indigo-800 shadow-md flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                           <Brain className="text-white/20 w-8 h-8 md:w-12 md:h-12" />
                       </div>

                       {/* Back (Revealed) */}
                       <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border-2 flex items-center justify-center p-2 shadow-inner overflow-hidden ${card.isMatched ? 'border-green-400 ring-2 ring-green-100' : 'border-blue-200'}`}>
                           {card.isMatched && (
                               <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 z-10">
                                   <Sparkles className="text-green-500 w-8 h-8 animate-ping" />
                               </div>
                           )}
                           
                           {card.type === 'image' ? (
                               <img src={card.content} alt="Memory" className="w-full h-full object-contain" />
                           ) : (
                               <span className="font-bold text-slate-800 text-xs md:text-sm text-center leading-tight">{card.content}</span>
                           )}
                       </div>
                   </div>
               </div>
           ))}
       </div>
       
       <style>{`
         .perspective-1000 { perspective: 1000px; }
         .transform-style-3d { transform-style: preserve-3d; }
         .backface-hidden { backface-visibility: hidden; }
         .rotate-y-180 { transform: rotateY(180deg); }
       `}</style>
    </div>
  );
};
