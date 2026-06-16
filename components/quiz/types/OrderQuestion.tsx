"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '../../../types';
import { GripVertical } from 'lucide-react';

interface OrderQuestionProps {
  question: Question;
  onOrderChange: (items: string[]) => void;
}

interface SortableItemProps {
  id: string;
  content: string;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`flex items-center p-4 mb-2 bg-white rounded-xl border-2 ${isDragging ? 'border-primary shadow-xl scale-105' : 'border-slate-200 shadow-sm'} cursor-grab active:cursor-grabbing touch-none`}
    >
      <GripVertical className="text-slate-400 mr-3" size={20} />
      <span className="font-medium text-slate-700">{content}</span>
    </div>
  );
};

export const OrderQuestion: React.FC<OrderQuestionProps> = ({ question, onOrderChange }) => {
  const [items, setItems] = useState(question.items || []);

  // Reset items if question changes
  useEffect(() => {
    setItems(question.items || []);
    if(question.items) {
        onOrderChange(question.items.map(i => i.id));
    }
  }, [question.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Notify parent of new order (ID array)
        onOrderChange(newOrder.map(i => i.id));
        
        return newOrder;
      });
    }
  };

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 mb-6">
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} content={item.content} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
