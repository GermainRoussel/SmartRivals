
import React, { useState } from 'react';
import { QuestionTheme, QuestionDifficulty, QuestionType } from '../../types';
import { Button } from '../ui/Button';
import { Layers, Zap, Brain, RotateCcw } from 'lucide-react';

interface GameSetupProps {
  onConfirm: (settings: GameSettings) => void;
  onCancel: () => void;
  confirmText?: string;
}

export interface GameSettings {
  themes: QuestionTheme[];
  difficulty: QuestionDifficulty | 'ANY';
  types: QuestionType[];
}

export const GameSetup: React.FC<GameSetupProps> = ({ onConfirm, onCancel, confirmText = "Lancer" }) => {
  const [selectedThemes, setSelectedThemes] = useState<QuestionTheme[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'ANY'>('ANY');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);

  const toggleTheme = (theme: QuestionTheme) => {
    setSelectedThemes(prev => 
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      themes: selectedThemes,
      difficulty: selectedDifficulty,
      types: selectedTypes
    });
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-5xl animate-in zoom-in-95 mx-auto">
      <h2 className="text-4xl font-display font-bold text-slate-800 mb-10 text-center">Paramètres de la Partie</h2>
      
      {/* Themes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-sm tracking-wider">
                <Layers size={18} /> Thèmes (Tout par défaut)
            </div>
            {selectedThemes.length > 0 && (
                <button onClick={() => setSelectedThemes([])} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    <RotateCcw size={12} /> Réinitialiser
                </button>
            )}
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.values(QuestionTheme).map((theme) => {
             const isSelected = selectedThemes.includes(theme);
             return (
                <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className={`px-5 py-3 rounded-2xl text-base font-bold transition-all border-2 ${
                        isSelected 
                        ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm scale-105' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {theme}
                </button>
             );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-sm tracking-wider">
                <Zap size={18} /> Difficulté
            </div>
            {selectedDifficulty !== 'ANY' && (
                <button onClick={() => setSelectedDifficulty('ANY')} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    <RotateCcw size={12} /> Réinitialiser
                </button>
            )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <button 
                onClick={() => setSelectedDifficulty('ANY')}
                className={`p-4 rounded-2xl font-bold text-base border-2 transition-transform active:scale-95 ${selectedDifficulty === 'ANY' ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
            >
                Mixte
           </button>
           {Object.values(QuestionDifficulty).map((diff) => (
               <button 
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`p-4 rounded-2xl font-bold text-base border-2 transition-transform active:scale-95 ${
                    selectedDifficulty === diff 
                    ? diff === QuestionDifficulty.EASY ? 'bg-green-100 border-green-500 text-green-700 shadow-md' : 
                      diff === QuestionDifficulty.MEDIUM ? 'bg-yellow-100 border-yellow-500 text-yellow-700 shadow-md' : 
                      diff === QuestionDifficulty.HARD ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-md' :
                      'bg-purple-900 border-purple-950 text-purple-100 shadow-md' // EXPERT STYLE (Purple/Dark)
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
                >
                {diff}
               </button>
           ))}
        </div>
      </div>

      {/* Types (Optional Advanced) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-sm tracking-wider">
                <Brain size={18} /> Types Spéciaux
            </div>
            {selectedTypes.length > 0 && (
                <button onClick={() => setSelectedTypes([])} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    <RotateCcw size={12} /> Réinitialiser
                </button>
            )}
        </div>
        <div className="flex flex-wrap gap-3">
            {[
                QuestionType.CHESS, QuestionType.SLIDER, QuestionType.MATCHING, 
                QuestionType.ORDER, QuestionType.SORTING, QuestionType.HOTSPOT, 
                QuestionType.HOLE_TEXT, QuestionType.BLIND_TEST, QuestionType.TRUE_FALSE,
                QuestionType.CONNECTIONS, QuestionType.ANAGRAM,
                QuestionType.PIXEL_REVEAL, QuestionType.REBUS, QuestionType.MATH_PUZZLE, 
                QuestionType.ODD_ONE_OUT, QuestionType.WORD_GUESS, QuestionType.DIFFERENCES, QuestionType.PATTERN
            ].map((t) => (
                 <button
                    key={t}
                    onClick={() => toggleType(t)} 
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedTypes.includes(t)
                        ? 'bg-purple-100 border-purple-400 text-purple-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                >
                    {t === QuestionType.CHESS ? 'Échecs' : 
                     t === QuestionType.MATCHING ? 'Relier' : 
                     t === QuestionType.ORDER ? 'Ordre' : 
                     t === QuestionType.SLIDER ? 'Curseur' : 
                     t === QuestionType.SORTING ? 'Tri' : 
                     t === QuestionType.HOTSPOT ? 'Hotspot' :
                     t === QuestionType.HOLE_TEXT ? 'Texte' : 
                     t === QuestionType.BLIND_TEST ? 'Blind Test' :
                     t === QuestionType.TRUE_FALSE ? 'Vrai/Faux' : 
                     t === QuestionType.CONNECTIONS ? 'Groupes' :
                     t === QuestionType.ANAGRAM ? 'Anagramme' : 
                     t === QuestionType.PIXEL_REVEAL ? 'Pixel' :
                     t === QuestionType.REBUS ? 'Rébus' :
                     t === QuestionType.MATH_PUZZLE ? 'Maths' :
                     t === QuestionType.ODD_ONE_OUT ? 'Intrus' : 
                     t === QuestionType.WORD_GUESS ? 'Motus' :
                     t === QuestionType.DIFFERENCES ? '7 Erreurs' :
                     t === QuestionType.PATTERN ? 'Logique' : t}
                </button>
            ))}
        </div>
      </div>

      <div className="flex gap-6">
        <Button variant="ghost" size="lg" fullWidth onClick={onCancel} className="text-lg">Annuler</Button>
        <Button fullWidth size="lg" onClick={handleConfirm} className="text-lg shadow-xl shadow-blue-500/20">{confirmText}</Button>
      </div>
    </div>
  );
};
