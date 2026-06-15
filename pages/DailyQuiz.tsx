
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { QuestionType, QuestionTheme, QuestionDifficulty, Question } from '../types';
import { ChessQuestion } from '../components/quiz/types/ChessQuestion';
import { OrderQuestion } from '../components/quiz/types/OrderQuestion';
import { MatchingQuestion } from '../components/quiz/types/MatchingQuestion';
import { SliderQuestion } from '../components/quiz/types/SliderQuestion';
import { HotspotQuestion } from '../components/quiz/types/HotspotQuestion';
import { HoleTextQuestion } from '../components/quiz/types/HoleTextQuestion';
import { BlindTestQuestion } from '../components/quiz/types/BlindTestQuestion';
import { TrueFalseQuestion } from '../components/quiz/types/TrueFalseQuestion';
import { ConnectionsQuestion } from '../components/quiz/types/ConnectionsQuestion';
import { AnagramQuestion } from '../components/quiz/types/AnagramQuestion';
import { PixelRevealQuestion } from '../components/quiz/types/PixelRevealQuestion';
import { MathPuzzleQuestion } from '../components/quiz/types/MathPuzzleQuestion';
import { RebusQuestion } from '../components/quiz/types/RebusQuestion';
import { OddOneOutQuestion } from '../components/quiz/types/OddOneOutQuestion';
import { WordGuessQuestion } from '../components/quiz/types/WordGuessQuestion';
import { DifferencesQuestion } from '../components/quiz/types/DifferencesQuestion';
import { PatternQuestion } from '../components/quiz/types/PatternQuestion';
import { Button } from '../components/ui/Button';
import { Clock, Flame, Trophy, FastForward, Play, Zap } from 'lucide-react';

// Mock Data with 10 Varied and Functional Questions
const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    type: QuestionType.MCQ,
    theme: QuestionTheme.GEO,
    difficulty: QuestionDifficulty.EASY,
    text: "Quelle est la capitale de l'Australie ?",
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctAnswer: 'Canberra'
  },
  {
    id: '2',
    type: QuestionType.CHESS,
    theme: QuestionTheme.CHESS_STRATEGY,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "Les Blancs jouent et font Mat en 1 coup. Trouvez le coup gagnant.",
    fen: "7k/4N1pp/8/2n3N1/2P3K1/8/8/8 w - - 0 1", 
    correctAnswer: "G5-F7" 
  },
  {
    id: '3',
    type: QuestionType.MATCHING,
    theme: QuestionTheme.CULTURE,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "Reliez le monument à sa ville.",
    pairs: [
        { left: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80", right: "Agra (Taj Mahal)" },
        { left: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=600", right: "Paris (Tour Eiffel)" },
        { left: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80", right: "Rome (Colisée)" },
        { left: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80", right: "Bangkok (Wat Arun)" }
    ]
  },
  {
    id: '4',
    type: QuestionType.SLIDER,
    theme: QuestionTheme.HISTORY,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "En quelle année le Titanic a-t-il fait naufrage ?",
    min: 1900,
    max: 1930,
    step: 1,
    unit: "",
    correctAnswer: 1912,
    tolerance: 0 
  },
  {
    id: '5',
    type: QuestionType.HOTSPOT,
    theme: QuestionTheme.GEO,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "Où se trouve le Japon ?",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1000px-World_map_-_low_resolution.svg.png",
    hotspotTarget: { x: 86, y: 35, tolerance: 5 }, // Approx coords
    correctAnswer: { x: 86, y: 35 }
  },
  {
    id: '6',
    type: QuestionType.INPUT,
    theme: QuestionTheme.MATH,
    difficulty: QuestionDifficulty.HARD,
    text: "Quelle est la suite logique : 1, 1, 2, 3, 5, 8, ... ?",
    correctAnswer: "13" // Fibonacci
  },
  {
    id: '7',
    type: QuestionType.ORDER,
    theme: QuestionTheme.SCIENCE,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "Classez ces planètes de la plus proche à la plus éloignée du Soleil.",
    items: [
      { id: 'mercure', content: 'Mercure' },
      { id: 'venus', content: 'Vénus' },
      { id: 'terre', content: 'Terre' },
      { id: 'mars', content: 'Mars' }
    ],
    correctAnswer: ['mercure', 'venus', 'terre', 'mars']
  },
  {
    id: '8',
    type: QuestionType.TRUE_FALSE,
    theme: QuestionTheme.NATURE,
    difficulty: QuestionDifficulty.EASY,
    text: "Les requins sont des mammifères.",
    correctAnswer: false
  },
  {
    id: '9',
    type: QuestionType.HOLE_TEXT,
    theme: QuestionTheme.CINEMA,
    difficulty: QuestionDifficulty.EASY,
    text: "Complétez cette réplique culte.",
    holeText: "Je suis ton {père}."
  },
  {
    id: '10',
    type: QuestionType.REBUS,
    theme: QuestionTheme.LOGIC,
    difficulty: QuestionDifficulty.MEDIUM,
    text: "Déchiffrez ce rébus.",
    rebusEmojis: "👑🐝",
    correctAnswer: "Reine des abeilles"
  }
];

const MAX_TIME = 15; // 15 seconds per question

export const DailyQuiz: React.FC = () => {
  const { quizState, startQuiz, submitAnswer, nextQuestion, resetQuiz } = useStore();
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  
  // UI State for immediate feedback (no overlay)
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'correct' | 'incorrect' | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(MAX_TIME);

  const currentQ = DEMO_QUESTIONS[quizState.currentQuestionIndex];

  useEffect(() => {
    startQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      resetQuiz();
    };
  }, []);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!hasStarted) return; 
    if (isValidating) return; 

    if (currentQ) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizState.currentQuestionIndex, hasStarted, isValidating]);

  useEffect(() => {
     if (currentQ) {
         setTimeLeft(MAX_TIME);
         setSelectedAnswer(null);
         setInputValue("");
         setValidationResult(null);
         setIsValidating(false);
         
         if (currentQ.type === QuestionType.ORDER && currentQ.items) {
             const shuffled = [...currentQ.items].sort(() => Math.random() - 0.5);
             setSelectedAnswer(shuffled.map(i => i.id));
         }
         if (currentQ.type === QuestionType.MATCHING) {
             setSelectedAnswer({});
         }
     }
  }, [quizState.currentQuestionIndex]);

  const handleStart = () => setHasStarted(true);

  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleValidation(null, false);
  };

  const validateAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let isCorrect = false;
    let answerToSubmit = selectedAnswer;

    if (!currentQ) return;

    switch (currentQ.type) {
        case QuestionType.MCQ:
        case QuestionType.IMAGE_MCQ:
        case QuestionType.BLIND_TEST:
        case QuestionType.ODD_ONE_OUT:
        case QuestionType.PATTERN:
            isCorrect = selectedAnswer === currentQ.correctAnswer;
            break;
        case QuestionType.INPUT:
        case QuestionType.ANAGRAM:
        case QuestionType.PIXEL_REVEAL:
        case QuestionType.MATH_PUZZLE:
        case QuestionType.REBUS:
        case QuestionType.WORD_GUESS:
            answerToSubmit = inputValue;
            const correctStr = (currentQ.correctAnswer as string).toLowerCase().trim();
            const userStr = inputValue.trim().toLowerCase();
            isCorrect = userStr === correctStr;
            break;
        case QuestionType.ORDER:
            isCorrect = JSON.stringify(selectedAnswer) === JSON.stringify(currentQ.correctAnswer);
            break;
        case QuestionType.MATCHING:
            const correctPairs = currentQ.pairs || [];
            const userMatches = selectedAnswer as Record<string, string>;
            if (userMatches && Object.keys(userMatches).length === correctPairs.length) {
                isCorrect = correctPairs.every(p => userMatches[p.left] === p.right);
            } else {
                isCorrect = false;
            }
            break;
        case QuestionType.SLIDER:
            const val = selectedAnswer as number;
            const target = currentQ.correctAnswer as number;
            const tolerance = currentQ.tolerance || 0;
            isCorrect = Math.abs(val - target) <= tolerance;
            break;
        case QuestionType.HOTSPOT:
             const coords = selectedAnswer as {x: number, y: number};
             const goal = currentQ.hotspotTarget || {x: 50, y: 50, tolerance: 10};
             if (coords) {
                const dist = Math.sqrt(Math.pow(coords.x - goal.x, 2) + Math.pow(coords.y - goal.y, 2));
                isCorrect = dist <= (goal.tolerance || 10);
             }
             break;
        case QuestionType.DIFFERENCES:
             const diffCoords = selectedAnswer as {x: number, y: number};
             const diffGoal = currentQ.diffTarget || {x: 50, y: 50, tolerance: 10};
             if (diffCoords) {
                const dist = Math.sqrt(Math.pow(diffCoords.x - diffGoal.x, 2) + Math.pow(diffCoords.y - diffGoal.y, 2));
                isCorrect = dist <= (diffGoal.tolerance || 10);
             }
             break;
        case QuestionType.HOLE_TEXT:
             const answers = selectedAnswer as string[];
             const regex = /({[^}]+})/g;
             const rawParts = (currentQ.holeText || "").split(regex);
             const expectedAnswers = rawParts
                .filter(p => p.startsWith('{') && p.endsWith('}'))
                .map(p => p.slice(1, -1));
             
             if (answers && answers.length === expectedAnswers.length) {
                 isCorrect = answers.every((ans, idx) => ans === expectedAnswers[idx]);
             }
             break;
        case QuestionType.TRUE_FALSE:
             isCorrect = selectedAnswer === currentQ.correctAnswer;
             break;
        case QuestionType.CHESS:
        case QuestionType.CONNECTIONS:
            break;
    }
    
    handleValidation(answerToSubmit, isCorrect);
  };

  const handleValidation = (answer: any, isCorrect: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      setValidationResult(isCorrect ? 'correct' : 'incorrect');
      setIsValidating(true);
      
      submitAnswer(currentQ.id, answer, isCorrect, timeLeftRef.current);

      setTimeout(() => {
          nextQuestion();
      }, 1500);
  };
  
  const handleSkip = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      handleValidation('skipped', false);
  }

  const handleDirectValidation = useCallback((isCorrect: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      handleValidation('complex', isCorrect);
  }, [currentQ?.id]);

  const handleComplexSuccess = useCallback(() => {
       if (timerRef.current) clearInterval(timerRef.current);
       handleValidation('complex_success', true);
  }, [currentQ?.id]);

  const handleMatchChange = useCallback((matches: Record<string, string>) => {
      setSelectedAnswer(matches);
  }, []);

  if (!hasStarted) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
            <div className="w-32 h-32 bg-blue-100 rounded-[40px] flex items-center justify-center mb-8 text-blue-600 shadow-inner -rotate-3">
                <Zap size={64} strokeWidth={2} className="fill-current" />
            </div>
            <h2 className="font-display text-4xl font-bold text-slate-800 mb-4">Le Quizz du Jour</h2>
            <p className="text-xl text-slate-500 mb-10 max-w-md">
                10 questions variées.<br/>
                <span className="font-bold text-red-500 text-2xl">{MAX_TIME} secondes</span> par question.
            </p>
            <Button size="lg" onClick={handleStart} className="px-12 py-6 text-xl rounded-2xl animate-pulse shadow-xl shadow-blue-200">
                C'est parti ! <Play fill="currentColor" className="ml-3" />
            </Button>
        </div>
      );
  }

  if (quizState.currentQuestionIndex >= DEMO_QUESTIONS.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 animate-in zoom-in-95">
        <Trophy className="w-24 h-24 text-yellow-500 mb-6 animate-bounce" />
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-4">Quizz Terminé !</h2>
        <p className="text-2xl text-slate-500 mb-10">Score final : <span className="font-black text-primary text-4xl">{quizState.score} pts</span></p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Série Max</div>
            <div className="font-black text-3xl text-orange-500">🔥 {quizState.streak}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Précision</div>
            <div className="font-black text-3xl text-blue-500">{(quizState.score / (DEMO_QUESTIONS.length * (100 + MAX_TIME * 10)) * 100).toFixed(0)}%</div>
          </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Correctes</div>
            <div className="font-black text-3xl text-green-500">{Object.values(quizState.answers).filter((a: any) => a !== 'skipped' && a !== null).length}/{DEMO_QUESTIONS.length}</div>
          </div>
        </div>
        <Button size="lg" onClick={() => window.location.hash = '#/leaderboard'}>Voir le classement</Button>
      </div>
    );
  }

  const showValidateButton = [
    QuestionType.MCQ, QuestionType.INPUT, QuestionType.IMAGE_MCQ, 
    QuestionType.ORDER, QuestionType.MATCHING, QuestionType.SLIDER, 
    QuestionType.HOTSPOT, QuestionType.HOLE_TEXT, QuestionType.BLIND_TEST,
    QuestionType.TRUE_FALSE, QuestionType.ANAGRAM, QuestionType.MATH_PUZZLE,
    QuestionType.PIXEL_REVEAL, QuestionType.ODD_ONE_OUT, QuestionType.REBUS,
    QuestionType.WORD_GUESS, QuestionType.DIFFERENCES, QuestionType.PATTERN
  ].includes(currentQ.type);
  
  const showSkipButton = [QuestionType.CHESS, QuestionType.CONNECTIONS].includes(currentQ.type);

  const isMatchingComplete = currentQ.type === QuestionType.MATCHING 
    ? selectedAnswer && Object.keys(selectedAnswer).length === (currentQ.pairs?.length || 0)
    : true;
  
  const isInputFilled = currentQ.type === QuestionType.INPUT || currentQ.type === QuestionType.ANAGRAM || currentQ.type === QuestionType.PIXEL_REVEAL || currentQ.type === QuestionType.MATH_PUZZLE || currentQ.type === QuestionType.REBUS || currentQ.type === QuestionType.WORD_GUESS
    ? !!inputValue
    : selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <div className="max-w-3xl mx-auto mt-4 pb-20 md:pb-0">
      {/* Top Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden">
            <div className={`absolute bottom-0 left-0 h-1 bg-slate-100 w-full`}>
                <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
                ></div>
            </div>
            <Clock size={20} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
            <span className={`font-mono text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                {timeLeft}s
            </span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
             <span className="text-slate-400 font-bold">SCORE</span>
             <span className="text-blue-600 font-black text-2xl">{quizState.score}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
             <Flame size={20} className={quizState.streak > 2 ? 'text-orange-500' : 'text-slate-300'} fill={quizState.streak > 2 ? "currentColor" : "none"} />
             <span className="text-orange-500 font-black text-2xl">{quizState.streak}</span>
        </div>
      </div>

      <div className="mb-6 px-2">
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${((quizState.currentQuestionIndex) / DEMO_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={`bg-white rounded-[32px] p-6 md:p-10 shadow-xl border-b-8 transition-colors duration-500 relative min-h-[400px] flex flex-col ${
          isValidating && validationResult === 'correct' ? 'border-green-500 ring-4 ring-green-100' : 
          isValidating && validationResult === 'incorrect' ? 'border-red-500 ring-4 ring-red-100' : 
          'border-slate-100'
      }`}>
        
        <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-800 leading-relaxed mt-2 flex-1">
                {currentQ.text}
            </h3>
             <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm tracking-wide ml-4 whitespace-nowrap">
                {quizState.currentQuestionIndex + 1} / {DEMO_QUESTIONS.length}
            </div>
        </div>
        
        {currentQ.imageUrl && ![QuestionType.HOTSPOT, QuestionType.PIXEL_REVEAL, QuestionType.DIFFERENCES, QuestionType.PATTERN].includes(currentQ.type) && (
            <div className="mb-6 flex justify-center">
                <img src={currentQ.imageUrl} alt="Question Context" className="rounded-xl shadow-md max-h-48 object-cover" />
            </div>
        )}

        {/* CONTENT AREA */}
        <div className={`flex-grow ${isValidating ? 'pointer-events-none opacity-80' : ''}`}>
            {currentQ.type === QuestionType.MCQ && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options?.map((opt) => {
                    const isSelected = selectedAnswer === opt;
                    let btnClass = "border-slate-200 hover:border-blue-300 text-slate-700";
                    
                    if (isSelected) {
                        if (isValidating) {
                             btnClass = validationResult === 'correct' 
                                ? "border-green-500 bg-green-50 text-green-700" 
                                : "border-red-500 bg-red-50 text-red-700";
                        } else {
                            btnClass = "border-primary bg-blue-50 text-primary shadow-md";
                        }
                    }

                    return (
                        <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            className={`p-4 text-left rounded-2xl border-2 transition-all font-bold text-lg active:scale-[0.98] shadow-sm ${btnClass}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
            )}

            {currentQ.type === QuestionType.IMAGE_MCQ && (
                <div className="grid grid-cols-2 gap-4">
                    {currentQ.imageOptions?.map((opt) => {
                        const isSelected = selectedAnswer === opt.id;
                         let btnClass = "border-slate-100 hover:border-blue-200";

                         if (isSelected) {
                             if (isValidating) {
                                 btnClass = validationResult === 'correct' ? "border-green-500 ring-2 ring-green-200" : "border-red-500 ring-2 ring-red-200";
                             } else {
                                 btnClass = "border-primary ring-2 ring-primary ring-offset-2";
                             }
                         }

                        return (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedAnswer(opt.id)}
                                className={`p-3 rounded-2xl border-4 transition-all active:scale-[0.95] relative overflow-hidden group ${btnClass}`}
                            >
                                <img src={opt.url} alt={opt.label} className="w-full h-24 object-contain mb-2 rounded-md" />
                                <div className="font-bold text-slate-700 text-center">{opt.label}</div>
                            </button>
                        );
                    })}
                </div>
            )}

            {currentQ.type === QuestionType.INPUT && (
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Votre réponse..."
                        className={`w-full p-6 text-3xl font-bold text-center rounded-2xl border-2 outline-none transition-colors ${
                            isValidating 
                             ? validationResult === 'correct' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'
                             : 'border-slate-200 focus:border-primary'
                        }`}
                        autoFocus
                    />
                </div>
            )}

            {currentQ.type === QuestionType.CHESS && (
                <div className="flex justify-center">
                    <ChessQuestion question={currentQ} onAnswer={handleDirectValidation} />
                </div>
            )}

            {currentQ.type === QuestionType.ORDER && (
                <OrderQuestion 
                    question={currentQ} 
                    onOrderChange={(items) => setSelectedAnswer(items)} 
                />
            )}

            {currentQ.type === QuestionType.MATCHING && (
                <MatchingQuestion 
                    question={currentQ} 
                    onMatchChange={handleMatchChange} 
                />
            )}

            {currentQ.type === QuestionType.SLIDER && (
                <SliderQuestion 
                    question={currentQ} 
                    onValueChange={(val) => setSelectedAnswer(val)} 
                />
            )}

            {currentQ.type === QuestionType.HOTSPOT && (
                <HotspotQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.HOLE_TEXT && (
                <HoleTextQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.BLIND_TEST && (
                <BlindTestQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.TRUE_FALSE && (
                <TrueFalseQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.CONNECTIONS && (
                <ConnectionsQuestion 
                    question={currentQ} 
                    onAnswer={(res) => handleComplexSuccess()} 
                />
            )}

            {currentQ.type === QuestionType.ANAGRAM && (
                <AnagramQuestion 
                    question={currentQ} 
                    onAnswer={setInputValue} 
                />
            )}

            {currentQ.type === QuestionType.PIXEL_REVEAL && (
                <PixelRevealQuestion 
                    question={currentQ} 
                    onAnswer={setInputValue} 
                />
            )}

            {currentQ.type === QuestionType.MATH_PUZZLE && (
                <MathPuzzleQuestion 
                    question={currentQ} 
                    onAnswer={setInputValue} 
                />
            )}

            {currentQ.type === QuestionType.REBUS && (
                <RebusQuestion 
                    question={currentQ} 
                    onAnswer={setInputValue} 
                />
            )}

            {currentQ.type === QuestionType.ODD_ONE_OUT && (
                <OddOneOutQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.WORD_GUESS && (
                <WordGuessQuestion 
                    question={currentQ} 
                    onAnswer={setInputValue} 
                />
            )}

            {currentQ.type === QuestionType.DIFFERENCES && (
                <DifferencesQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}

            {currentQ.type === QuestionType.PATTERN && (
                <PatternQuestion 
                    question={currentQ} 
                    onAnswer={setSelectedAnswer} 
                />
            )}
        </div>
        
        {/* ACTION BAR */}
        <div className="mt-8 flex items-center gap-3">
             {/* Validate Button */}
             {showValidateButton && (
                <Button 
                    fullWidth 
                    size="lg" 
                    onClick={validateAnswer}
                    disabled={
                        isValidating ||
                        (currentQ.type === QuestionType.MATCHING && !isMatchingComplete) ||
                        !isInputFilled
                    }
                    className={`border-b-4 transition-all ${
                        isValidating && validationResult === 'correct' ? 'bg-green-500 border-green-700 hover:bg-green-500' :
                        isValidating && validationResult === 'incorrect' ? 'bg-red-500 border-red-700 hover:bg-red-500' :
                        'bg-sidebar-text hover:bg-slate-800 text-white border-slate-950'
                    }`}
                >
                    {isValidating ? (validationResult === 'correct' ? 'Correct !' : 'Incorrect') : 'Valider'}
                </Button>
            )}
            
            {showSkipButton && !isValidating && (
                <div className="w-full text-center text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
                   <span>Résolvez le puzzle ci-dessus</span>
                </div>
            )}
             {showSkipButton && !isValidating && (
                <Button variant="ghost" onClick={handleSkip} className="text-slate-400 hover:text-slate-600 ml-auto absolute right-6 bottom-6 md:static">
                    Passer <FastForward className="ml-2" size={18} />
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};
