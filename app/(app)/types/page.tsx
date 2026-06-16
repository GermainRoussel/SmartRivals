"use client";

import { useMemo, useState } from "react";
import {
  X,
  Play,
  Shuffle,
  RotateCcw,
  Check,
  Library,
  ListOrdered,
  Crown,
  MousePointerClick,
  MoveHorizontal,
  Type,
  Image as ImageIcon,
  ArrowLeftRight,
  Target,
  TextCursorInput,
  Music,
  ThumbsUp,
  Grid3X3,
  Puzzle,
  Eye,
  Calculator,
  Smile,
  AlertTriangle,
  SpellCheck,
  ScanSearch,
  BoxSelect,
  LucideIcon,
} from "lucide-react";
import { QuestionPlayer } from "@/components/quiz/QuestionPlayer";
import { SAMPLES, CATALOG_TYPES } from "@/lib/quiz/bank";
import { QuestionType } from "@/types";

const TYPE_INFO: Record<QuestionType, { label: string; icon: LucideIcon; desc: string }> = {
  [QuestionType.MCQ]: { label: "QCM Classique", icon: ListOrdered, desc: "Choisissez la bonne réponse parmi 4 propositions." },
  [QuestionType.CHESS]: { label: "Jeu d'échecs", icon: Crown, desc: "Trouvez le meilleur coup (Mat, tactique) sur l'échiquier." },
  [QuestionType.MATCHING]: { label: "Association", icon: MousePointerClick, desc: "Reliez des éléments par paires (Texte/Image)." },
  [QuestionType.SLIDER]: { label: "Curseur", icon: MoveHorizontal, desc: "Estimez une date, un nombre ou une quantité." },
  [QuestionType.ORDER]: { label: "Mise en Ordre", icon: ListOrdered, desc: "Glissez-déposez pour trier chronologiquement ou logiquement." },
  [QuestionType.INPUT]: { label: "Saisie Libre", icon: Type, desc: "Tapez la réponse exacte sans suggestions." },
  [QuestionType.IMAGE_MCQ]: { label: "QCM Image", icon: ImageIcon, desc: "Identifiez une image avec des choix de réponses." },
  [QuestionType.SORTING]: { label: "Tri Rapide", icon: ArrowLeftRight, desc: "Classez rapidement des éléments dans deux catégories." },
  [QuestionType.HOTSPOT]: { label: "Point & Click", icon: Target, desc: "Cliquez sur la zone précise de l'image." },
  [QuestionType.HOLE_TEXT]: { label: "Texte à Trous", icon: TextCursorInput, desc: "Complétez la phrase avec les bons mots." },
  [QuestionType.BLIND_TEST]: { label: "Blind Test", icon: Music, desc: "Écoutez l'extrait sonore et trouvez la réponse." },
  [QuestionType.TRUE_FALSE]: { label: "Vrai / Faux", icon: ThumbsUp, desc: "Rapidité ! Affirmez ou infirmez la proposition." },
  [QuestionType.CONNECTIONS]: { label: "Groupes", icon: Grid3X3, desc: "Trouvez 4 groupes de 4 mots ayant un lien commun." },
  [QuestionType.ANAGRAM]: { label: "Anagramme", icon: Puzzle, desc: "Remettez les lettres dans l'ordre pour trouver le mot." },
  [QuestionType.PIXEL_REVEAL]: { label: "Pixel Reveal", icon: Eye, desc: "Devinez l'image avant qu'elle ne devienne nette." },
  [QuestionType.MATH_PUZZLE]: { label: "Math Puzzle", icon: Calculator, desc: "Résolvez l'équation en complétant les trous." },
  [QuestionType.REBUS]: { label: "Rébus", icon: Smile, desc: "Traduisez la suite d'émojis." },
  [QuestionType.ODD_ONE_OUT]: { label: "Intrus", icon: AlertTriangle, desc: "Trouvez l'élément qui ne va pas avec les autres." },
  [QuestionType.WORD_GUESS]: { label: "Mot Mystère", icon: SpellCheck, desc: "Devinez le mot secret (type Wordle)." },
  [QuestionType.DIFFERENCES]: { label: "7 Erreurs", icon: ScanSearch, desc: "Trouvez la différence entre les deux images." },
  [QuestionType.PATTERN]: { label: "Suite Logique", icon: BoxSelect, desc: "Complétez la suite visuelle (Test de QI)." },
  [QuestionType.SIMON]: { label: "Simon", icon: Grid3X3, desc: "" },
};

export default function TypesPage() {
  const [activeType, setActiveType] = useState<QuestionType | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const samples = activeType ? SAMPLES[activeType] ?? [] : [];
  const currentQ = samples[exampleIndex % Math.max(samples.length, 1)];

  const open = (type: QuestionType) => {
    setActiveType(type);
    setExampleIndex(0);
    setAttempt(0);
    setResult(null);
  };

  const close = () => setActiveType(null);

  const nextExample = () => {
    setExampleIndex((i) => i + 1);
    setAttempt((a) => a + 1);
    setResult(null);
  };

  const retry = () => {
    setAttempt((a) => a + 1);
    setResult(null);
  };

  const cards = useMemo(() => CATALOG_TYPES, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-12">
      <div className="text-center mb-10 pt-4">
        <h2 className="font-display text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
          <Library className="text-blue-500" size={40} />
          Catalogue des Quizz
        </h2>
        <p className="text-slate-500 text-lg">
          Découvrez et testez tous les formats de questions disponibles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {cards.map((type) => {
          const info = TYPE_INFO[type];
          const Icon = info.icon;
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => open(type)}
              className={`bg-white p-6 rounded-3xl border-4 text-left transition-all group relative overflow-hidden ${
                isActive
                  ? "border-blue-500 shadow-xl scale-105 ring-4 ring-blue-100 z-10"
                  : "border-slate-100 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isActive ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-500 group-hover:bg-blue-100"
                }`}
              >
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2">{info.label}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{info.desc}</p>
              <div className="mt-4 flex items-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Tester <Play size={14} className="ml-1" fill="currentColor" />
              </div>
            </button>
          );
        })}
      </div>

      {activeType && currentQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={close} />

          <div className="bg-white rounded-[40px] w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col relative z-10 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                  Zone de Test
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-800">
                  {TYPE_INFO[activeType].label}
                </h3>
              </div>
              <div className="flex gap-2">
                {samples.length > 1 && (
                  <button
                    onClick={nextExample}
                    aria-label="Exemple suivant"
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <Shuffle size={16} /> <span className="hidden sm:inline">Exemple suivant</span>
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Fermer"
                  className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
              <div className="flex items-center justify-center mb-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Thème : {currentQ.theme}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                {currentQ.text}
              </h4>

              <QuestionPlayer
                key={`${currentQ.id}-${attempt}`}
                question={currentQ}
                onResult={(isCorrect) => setResult(isCorrect ? "correct" : "incorrect")}
                allowSkip
              />

              {result && (
                <div
                  className={`mt-6 p-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold animate-in zoom-in-95 ${
                    result === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {result === "correct" ? <Check size={28} strokeWidth={3} /> : <X size={28} strokeWidth={3} />}
                  {result === "correct" ? "Bonne réponse !" : "Mauvaise réponse, essayez encore."}
                  {result === "incorrect" && (
                    <button onClick={retry} className="ml-2 underline flex items-center gap-1">
                      <RotateCcw size={16} /> Réessayer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
