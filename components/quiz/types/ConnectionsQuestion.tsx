
import React, { useState, useEffect } from 'react';
import { Question } from '../../../types';

interface ConnectionsQuestionProps {
  question: Question;
  onAnswer: (foundGroups: string[][]) => void;
}

interface GridItem {
  id: string;
  content: string;
  groupId: string;
}

export const ConnectionsQuestion: React.FC<ConnectionsQuestionProps> = ({ question, onAnswer }) => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // IDs
  const [solvedGroups, setSolvedGroups] = useState<string[]>([]); // Group IDs
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (question.connectionsGroups) {
      // Flatten and shuffle items
      const allItems: GridItem[] = [];
      question.connectionsGroups.forEach(group => {
        group.items.forEach((itemContent, idx) => {
          allItems.push({
            id: `${group.id}-${idx}`,
            content: itemContent,
            groupId: group.id
          });
        });
      });
      // Shuffle
      setItems(allItems.sort(() => Math.random() - 0.5));
      setSelectedItems([]);
      setSolvedGroups([]);
      setMistakes(0);
    }
  }, [question.id]);

  useEffect(() => {
      // Send answer when all groups found
      if (question.connectionsGroups && solvedGroups.length === question.connectionsGroups.length) {
          const result = solvedGroups.map(gid => {
              const g = question.connectionsGroups?.find(grp => grp.id === gid);
              return g ? g.items : [];
          });
          onAnswer(result);
      }
  }, [solvedGroups]);

  // AUTO-VALIDATION LOGIC
  useEffect(() => {
    if (selectedItems.length === 4) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500); // 500ms delay to let user see their 4th selection
      return () => clearTimeout(timer);
    }
  }, [selectedItems]);

  const handleSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } else {
      if (selectedItems.length < 4) {
        setSelectedItems(prev => [...prev, itemId]);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedItems.length !== 4) return;

    // Check if all selected items belong to the same group
    const firstItem = items.find(i => i.id === selectedItems[0]);
    if (!firstItem) return;
    
    const targetGroupId = firstItem.groupId;
    const isSuccess = selectedItems.every(id => {
       const item = items.find(i => i.id === id);
       return item?.groupId === targetGroupId;
    });

    if (isSuccess) {
      setSolvedGroups(prev => [...prev, targetGroupId]);
      setSelectedItems([]);
    } else {
      setMistakes(prev => prev + 1);
      setShake(true);
      setTimeout(() => {
          setShake(false);
          setSelectedItems([]);
      }, 500);
    }
  };

  // Organize items: Solved groups on top (collapsed), then unsolved grid
  const solvedGroupsData = question.connectionsGroups?.filter(g => solvedGroups.includes(g.id)) || [];
  const activeItems = items.filter(i => !solvedGroups.includes(i.groupId));

  return (
    <div className="w-full min-h-[320px] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto select-none">
        <div className="text-center mb-6 text-slate-500 font-medium text-sm">
          Créez {question.connectionsGroups?.length || 4} groupes de 4 éléments liés.
        </div>

        {/* Solved Groups Display */}
        <div className="space-y-3 mb-4">
          {solvedGroupsData.map(group => (
              <div key={group.id} className="bg-green-500 text-white rounded-2xl p-4 text-center animate-in zoom-in-95">
                  <div className="font-black uppercase text-lg mb-1">{group.label}</div>
                  <div className="text-sm font-medium opacity-90">{group.items.join(', ')}</div>
              </div>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}>
          {activeItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                  <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`aspect-[4/3] md:aspect-square flex items-center justify-center p-2 rounded-xl text-sm md:text-base font-bold transition-all border-b-4 active:scale-95 leading-tight ${
                          isSelected 
                          ? 'bg-slate-700 text-white border-slate-900 -translate-y-1' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                  >
                      {item.content}
                  </button>
              )
          })}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Erreurs :</span>
              <div className="flex gap-1">
                  {[...Array(mistakes)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-red-400"></div>
                  ))}
              </div>
          </div>
          <div className="flex gap-3">
              <button 
                  onClick={() => setSelectedItems([])}
                  className="px-6 py-2 rounded-full font-bold text-slate-400 text-sm hover:bg-slate-50 transition-colors"
                  disabled={selectedItems.length === 0}
              >
                  Désélectionner tout
              </button>
          </div>
        </div>
        
        <style>{`
          @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
          }
          .animate-shake {
              animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};
