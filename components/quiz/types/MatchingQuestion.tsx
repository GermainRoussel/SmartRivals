"use client";

import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';
import { Link2, GripHorizontal } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragStartEvent, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';

interface MatchingQuestionProps {
  question: Question;
  onMatchChange: (matches: Record<string, string>) => void;
}

interface LeftItemProps {
  item: string;
  isMatched: boolean;
  isSelected: boolean;
  onSelect: () => void;
  hasError?: boolean;
  onError: () => void;
}

interface RightItemProps {
  item: string;
  isMatched: boolean;
  isTargetable: boolean;
  onClick: () => void;
}

// --- DRAGGABLE COMPONENT (LEFT) ---
const DraggableLeftItem = ({ item, isMatched, isSelected, onSelect, hasError, onError }: LeftItemProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item,
        disabled: isMatched,
        data: { type: 'left', content: item }
    });

    const isImage = item.startsWith('http') || item.startsWith('data:image');

    let containerClass = `relative w-full rounded-xl border-2 md:border-4 transition-all duration-200 overflow-hidden shadow-sm group touch-none `;
    
    if (isMatched) {
        containerClass += "border-indigo-500 ring-2 md:ring-4 ring-indigo-100 bg-indigo-50 cursor-default ";
    } else if (isSelected) {
        containerClass += "border-blue-500 ring-2 md:ring-4 ring-blue-100 bg-blue-50 scale-[1.02] z-10 cursor-pointer ";
    } else if (isDragging) {
        containerClass += "opacity-30 border-blue-300 ";
    } else {
        containerClass += "border-slate-100 hover:border-blue-300 hover:shadow-md bg-white cursor-grab active:cursor-grabbing ";
    }

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} onClick={!isDragging ? onSelect : undefined} className={containerClass + " h-16 md:h-20"}>
             {isImage && !hasError ? (
                <>
                    <img 
                        src={item} 
                        alt="Option" 
                        className={`w-full h-full object-cover transition-transform duration-500 ${isMatched ? 'grayscale-[20%]' : 'group-hover:scale-105'}`}
                        onError={onError}
                    />
                    {isMatched && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white rounded-full p-1.5 shadow-lg">
                                <Link2 className="text-indigo-600" size={16} strokeWidth={3} />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full p-2 bg-slate-50">
                     <GripHorizontal className="absolute left-2 text-slate-300 md:hidden" size={16} />
                    <span className={`font-bold text-xs md:text-sm leading-tight text-center truncate px-1 ${isMatched ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {hasError ? "Image introuvable" : item}
                    </span>
                    {isMatched && (
                        <div className="absolute right-1 top-1 bg-indigo-200 text-indigo-700 p-0.5 rounded-full">
                            <Link2 size={10} strokeWidth={3} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// --- DROPPABLE COMPONENT (RIGHT) ---
const DroppableRightItem = ({ item, isMatched, isTargetable, onClick }: RightItemProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: item,
        disabled: isMatched,
        data: { type: 'right', content: item }
    });

    let containerClass = `relative w-full rounded-xl border-2 md:border-4 transition-all duration-200 flex items-center justify-center p-2 h-16 md:h-20 `;
    
    if (isMatched) {
        containerClass += "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-default ";
    } else if (isOver) {
        containerClass += "border-blue-500 bg-blue-100 text-blue-900 scale-105 shadow-md "; // Highlight on drag over
    } else if (isTargetable) {
        containerClass += "border-dashed border-blue-400 bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100 hover:border-blue-600 animate-pulse ";
    } else {
        containerClass += "border-slate-100 bg-white text-slate-600 cursor-default ";
    }

    return (
        <div ref={setNodeRef} onClick={isTargetable ? onClick : undefined} className={containerClass}>
            <span className="font-bold text-xs md:text-sm text-center w-full leading-tight select-none pointer-events-none">
                {item}
            </span>
             {isMatched && (
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-200 text-indigo-700 p-1 rounded-full animate-in zoom-in-50 hidden md:block">
                     <Link2 size={12} strokeWidth={3} />
                 </div>
             )}
        </div>
    )
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ question, onMatchChange }) => {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeDragItem, setActiveDragItem] = useState<string | null>(null);

  // Sensors for better touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  useEffect(() => {
    if (question.pairs) {
      const lefts = question.pairs.map(p => p.left);
      const rights = question.pairs.map(p => p.right);
      const shuffledRights = [...rights].sort(() => Math.random() - 0.5);
      
      setLeftItems(lefts);
      setRightItems(shuffledRights);
      setMatches({});
      setSelectedLeft(null);
      setImageErrors({});
    }
  }, [question.id]);

  useEffect(() => {
    onMatchChange(matches);
  }, [matches, onMatchChange]);

  const handleLeftClick = (item: string) => {
    if (matches[item]) {
      // Unmatch
      const newMatches = { ...matches };
      delete newMatches[item];
      setMatches(newMatches);
    } else {
      // Select
      setSelectedLeft(item === selectedLeft ? null : item);
    }
  };

  const handleRightClick = (item: string) => {
    if (!selectedLeft) return;
    if (Object.values(matches).includes(item)) return;

    setMatches(prev => ({ ...prev, [selectedLeft]: item }));
    setSelectedLeft(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
      setActiveDragItem(event.active.id as string);
      // Auto-select on drag for visual feedback
      setSelectedLeft(event.active.id as string);
  }

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragItem(null);
      
      if (over && over.id) {
          const leftId = active.id as string;
          const rightId = over.id as string;
          
          // Check if right item is already matched
          if (Object.values(matches).includes(rightId)) return;

          setMatches(prev => ({ ...prev, [leftId]: rightId }));
          setSelectedLeft(null);
      }
  };

  const handleImageError = (item: string) => {
      setImageErrors(prev => ({...prev, [item]: true}));
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="w-full max-w-5xl mx-auto select-none">
            <div className="flex items-center justify-center gap-2 mb-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <Link2 size={14} />
                <span>Glissez ou Cliquez (Gauche ➝ Droite)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 relative">
                {/* Left Column */}
                <div className="space-y-3">
                {leftItems.map((item, idx) => (
                    <DraggableLeftItem 
                        key={`left-${idx}`}
                        item={item}
                        isMatched={!!matches[item]}
                        isSelected={selectedLeft === item}
                        onSelect={() => handleLeftClick(item)}
                        hasError={imageErrors[item]}
                        onError={() => handleImageError(item)}
                    />
                ))}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                {rightItems.map((item, idx) => (
                    <DroppableRightItem 
                        key={`right-${idx}`}
                        item={item}
                        isMatched={Object.values(matches).includes(item)}
                        isTargetable={!!selectedLeft && !Object.values(matches).includes(item)}
                        onClick={() => handleRightClick(item)}
                    />
                ))}
                </div>
            </div>
            
            {/* Visual Overlay during Drag */}
            <DragOverlay>
                {activeDragItem ? (
                    <div className="opacity-90 scale-105 pointer-events-none w-[150px]">
                        {/* Simplified preview */}
                        <div className="bg-blue-600 text-white p-3 rounded-xl shadow-2xl font-bold text-sm truncate border-2 border-white">
                            {activeDragItem.startsWith('http') ? 'Image...' : activeDragItem}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

          </div>
      </DndContext>
    </div>
  );
};
