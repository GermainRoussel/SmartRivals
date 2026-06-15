
import React, { useState } from 'react';
import { QuestionType, QuestionTheme, QuestionDifficulty, Question } from '../types';
import { ChessQuestion } from '../components/quiz/types/ChessQuestion';
import { OrderQuestion } from '../components/quiz/types/OrderQuestion';
import { MatchingQuestion } from '../components/quiz/types/MatchingQuestion';
import { SliderQuestion } from '../components/quiz/types/SliderQuestion';
import { SortingQuestion } from '../components/quiz/types/SortingQuestion';
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
import { Check, X, Play, Library, MousePointerClick, MoveHorizontal, ListOrdered, Crown, Image as ImageIcon, Type, ArrowLeftRight, Shuffle, Target, TextCursorInput, Music, ThumbsUp, RotateCcw, Grid3X3, Puzzle, Eye, Calculator, Smile, AlertTriangle, SpellCheck, ScanSearch, BoxSelect } from 'lucide-react';

// Sample data for demonstration
const DEMO_SAMPLES: Record<QuestionType, Question[]> = {
  [QuestionType.MCQ]: [
    {
        id: 'demo-mcq-1',
        type: QuestionType.MCQ,
        theme: QuestionTheme.GEO,
        difficulty: QuestionDifficulty.EASY,
        text: "Quelle est la capitale de l'Australie ?",
        options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correctAnswer: 'Canberra'
    },
    {
        id: 'demo-mcq-2',
        type: QuestionType.MCQ,
        theme: QuestionTheme.SCIENCE,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Quel est le symbole chimique de l'Or ?",
        options: ['Au', 'Ag', 'Fe', 'Go'],
        correctAnswer: 'Au'
    }
  ],
  [QuestionType.CHESS]: [
    {
        id: 'chess-1',
        type: QuestionType.CHESS,
        theme: QuestionTheme.CHESS_STRATEGY,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Mat en 1 : Tour blanche.",
        fen: "6k1/3R4/6K1/8/8/8/8/8 w - - 0 1",
        correctAnswer: "D7-D8" 
    },
    {
        id: 'chess-2',
        type: QuestionType.CHESS,
        theme: QuestionTheme.CHESS_STRATEGY,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Mat en 1 : Dame blanche.",
        fen: "k7/8/K7/8/8/8/5Q2/8 w - - 0 1",
        correctAnswer: "F2-F8"
    }
  ],
  [QuestionType.MATCHING]: [
      {
        id: 'match-1',
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
        id: 'match-2',
        type: QuestionType.MATCHING,
        theme: QuestionTheme.MATH,
        difficulty: QuestionDifficulty.EASY,
        text: "Reliez l'opération à son résultat.",
        pairs: [
            { left: "5 x 5", right: "25" },
            { left: "12 / 4", right: "3" },
            { left: "7 + 8", right: "15" },
            { left: "20 - 9", right: "11" }
        ]
      }
  ],
  [QuestionType.SLIDER]: [
      {
        id: 'slider-1',
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
        id: 'slider-2',
        type: QuestionType.SLIDER,
        theme: QuestionTheme.SCIENCE,
        difficulty: QuestionDifficulty.EASY,
        text: "Température d'ébullition de l'eau (°C) ?",
        min: 0,
        max: 200,
        step: 5,
        unit: "°C",
        correctAnswer: 100,
        tolerance: 5
      }
  ],
  [QuestionType.ORDER]: [
      {
        id: 'order-1',
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
        id: 'order-2',
        type: QuestionType.ORDER,
        theme: QuestionTheme.HISTORY,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Classez ces événements chronologiquement.",
        items: [
            { id: '1', content: 'Révolution Française' },
            { id: '2', content: 'Chute de Rome' },
            { id: '3', content: 'Premier pas sur la Lune' },
            { id: '4', content: 'Découverte de l\'Amérique' }
        ],
        correctAnswer: ['2', '4', '1', '3']
      }
  ],
  [QuestionType.INPUT]: [
      {
        id: 'input-1',
        type: QuestionType.INPUT,
        theme: QuestionTheme.MATH,
        difficulty: QuestionDifficulty.HARD,
        text: "Quelle est la suite : 2, 4, 8, 16, ... ?",
        correctAnswer: "32"
      },
      {
        id: 'input-2',
        type: QuestionType.INPUT,
        theme: QuestionTheme.LOGIC,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Je commence la nuit et je finis le matin. Qui suis-je ? (Lettre)",
        correctAnswer: "N"
      }
  ],
  [QuestionType.IMAGE_MCQ]: [
    {
        id: 'demo-image-mcq-1',
        type: QuestionType.IMAGE_MCQ,
        theme: QuestionTheme.GEO,
        difficulty: QuestionDifficulty.HARD,
        text: "À quel pays appartient ce drapeau ?",
        imageUrl: 'https://flagcdn.com/w640/sc.png',
        options: ['Seychelles', 'Maurice', 'Fidji', 'Tonga'],
        correctAnswer: 'Seychelles'
    },
    {
        id: 'demo-image-mcq-2',
        type: QuestionType.IMAGE_MCQ,
        theme: QuestionTheme.ART,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Qui a peint cette oeuvre ?",
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
        options: ['Da Vinci', 'Michel-Ange', 'Raphaël', 'Donatello'],
        correctAnswer: 'Da Vinci'
    }
  ],
  [QuestionType.SORTING]: [
      {
        id: 'sort-1',
        type: QuestionType.SORTING,
        theme: QuestionTheme.NUTRITION,
        difficulty: QuestionDifficulty.EASY,
        text: "Fruit ou Légume (au sens culinaire) ?",
        groups: [{ id: 'F', label: 'Fruit' }, { id: 'L', label: 'Légume' }],
        sortingItems: [
            { id: '1', content: 'Banane', correctGroupId: 'F' },
            { id: '2', content: 'Courgette', correctGroupId: 'L' },
            { id: '3', content: 'Pomme', correctGroupId: 'F' },
            { id: '4', content: 'Poireau', correctGroupId: 'L' },
            { id: '5', content: 'Fraise', correctGroupId: 'F' }
        ],
      },
      {
        id: 'sort-2',
        type: QuestionType.SORTING,
        theme: QuestionTheme.CULTURE,
        difficulty: QuestionDifficulty.MEDIUM,
        text: "Marvel ou DC Comics ?",
        groups: [{ id: 'M', label: 'Marvel', color: 'red' }, { id: 'D', label: 'DC', color: 'blue' }],
        sortingItems: [
            { id: '1', content: 'Batman', correctGroupId: 'D' },
            { id: '2', content: 'Iron Man', correctGroupId: 'M' },
            { id: '3', content: 'Wonder Woman', correctGroupId: 'D' },
            { id: '4', content: 'Thor', correctGroupId: 'M' },
            { id: '5', content: 'Superman', correctGroupId: 'D' }
        ],
      }
  ],
  [QuestionType.HOTSPOT]: [
      {
          id: 'hotspot-1',
          type: QuestionType.HOTSPOT,
          theme: QuestionTheme.GEO,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Où se trouve le Japon ?",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1000px-World_map_-_low_resolution.svg.png",
          hotspotTarget: { x: 86, y: 35, tolerance: 5 }, 
          correctAnswer: { x: 86, y: 35 }
      },
      {
          id: 'hotspot-2',
          type: QuestionType.HOTSPOT,
          theme: QuestionTheme.SCIENCE,
          difficulty: QuestionDifficulty.HARD,
          text: "Cliquez sur le fémur.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Human_skeleton_front_en.svg/640px-Human_skeleton_front_en.svg.png",
          hotspotTarget: { x: 35, y: 55, tolerance: 10 },
          correctAnswer: { x: 35, y: 55 }
      }
  ],
  [QuestionType.HOLE_TEXT]: [
      {
          id: 'hole-1',
          type: QuestionType.HOLE_TEXT,
          theme: QuestionTheme.CINEMA,
          difficulty: QuestionDifficulty.EASY,
          text: "Complétez cette réplique culte de Star Wars.",
          holeText: "Non, je suis ton {père}."
      },
      {
          id: 'hole-2',
          type: QuestionType.HOLE_TEXT,
          theme: QuestionTheme.HISTORY,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Complétez la phrase.",
          holeText: "Napoléon a été exilé sur l'île de {Sainte-Hélène} en {1815}."
      }
  ],
  [QuestionType.BLIND_TEST]: [
      {
          id: 'blind-1',
          type: QuestionType.BLIND_TEST,
          theme: QuestionTheme.MUSIC,
          difficulty: QuestionDifficulty.EASY,
          text: "Quel est cet instrument ?",
          // Reliable Wikimedia Commons Audio
          audioUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Alarm_Clock_Ringing.ogg",
          options: ['Violon', 'Trompette', 'Réveil', 'Flûte'],
          correctAnswer: 'Réveil'
      },
      {
          id: 'blind-2',
          type: QuestionType.BLIND_TEST,
          theme: QuestionTheme.CARS,
          difficulty: QuestionDifficulty.HARD,
          text: "Quelle voiture produit ce son ?",
          // Reliable Wikimedia Commons Audio (Ferrari 360 Modena accelerating)
          audioUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Ferrari_360_Modena_-_Accelerating.ogg",
          options: ['Ferrari 360 Modena', 'Renault Clio', 'Camion Poubelle', 'Vélo électrique'],
          correctAnswer: 'Ferrari 360 Modena'
      }
  ],
  [QuestionType.TRUE_FALSE]: [
      {
          id: 'tf-1',
          type: QuestionType.TRUE_FALSE,
          theme: QuestionTheme.SCIENCE,
          difficulty: QuestionDifficulty.EASY,
          text: "L'eau bout à 100°C au niveau de la mer.",
          correctAnswer: true
      },
      {
          id: 'tf-2',
          type: QuestionType.TRUE_FALSE,
          theme: QuestionTheme.NATURE,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Les tomates sont des légumes.",
          correctAnswer: false
      }
  ],
  [QuestionType.CONNECTIONS]: [
      {
          id: 'conn-1',
          type: QuestionType.CONNECTIONS,
          theme: QuestionTheme.CULTURE,
          difficulty: QuestionDifficulty.HARD,
          text: "Créez 4 groupes de 4 mots liés.",
          connectionsGroups: [
              { id: 'A', label: 'Planètes', items: ['Mars', 'Vénus', 'Jupiter', 'Saturne'] },
              { id: 'B', label: 'Dieux Grecs', items: ['Zeus', 'Héra', 'Poséidon', 'Hadès'] },
              { id: 'C', label: 'Barres Chocolatées', items: ['Mars', 'Lion', 'Twix', 'Bounty'] },
              { id: 'D', label: 'Marques de Voiture', items: ['Ford', 'Tesla', 'Fiat', 'Honda'] }
          ],
          correctAnswer: "COMPLEX_VALIDATION"
      },
      {
          id: 'conn-2',
          type: QuestionType.CONNECTIONS,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Associez les éléments.",
          connectionsGroups: [
              { id: 'A', label: 'Feu', items: ['Flamme', 'Brasier', 'Incendie', 'Étincelle'] },
              { id: 'B', label: 'Eau', items: ['Océan', 'Rivière', 'Pluie', 'Lac'] },
              { id: 'C', label: 'Air', items: ['Vent', 'Souffle', 'Oxygène', 'Nuage'] },
              { id: 'D', label: 'Terre', items: ['Sol', 'Rocher', 'Sable', 'Montagne'] }
          ],
          correctAnswer: "COMPLEX_VALIDATION"
      }
  ],
  [QuestionType.ANAGRAM]: [
      {
          id: 'ana-1',
          type: QuestionType.ANAGRAM,
          theme: QuestionTheme.GEO,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Reconstituez le nom de ce pays.",
          anagramWord: "PORTUGAL",
          correctAnswer: "PORTUGAL"
      },
      {
          id: 'ana-2',
          type: QuestionType.ANAGRAM,
          theme: QuestionTheme.NATURE,
          difficulty: QuestionDifficulty.EASY,
          text: "Quel est cet animal ?",
          anagramWord: "ELEPHANT",
          correctAnswer: "ELEPHANT"
      }
  ],
  [QuestionType.PIXEL_REVEAL]: [
      {
          id: 'pix-1',
          type: QuestionType.PIXEL_REVEAL,
          theme: QuestionTheme.NATURE,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Devinez l'animal avant que l'image ne soit nette !",
          pixelImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
          correctAnswer: "LION"
      },
      {
          id: 'pix-2',
          type: QuestionType.PIXEL_REVEAL,
          theme: QuestionTheme.GEO,
          difficulty: QuestionDifficulty.HARD,
          text: "Quelle est cette ville ?",
          pixelImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
          correctAnswer: "PARIS"
      }
  ],
  [QuestionType.MATH_PUZZLE]: [
      {
          id: 'math-1',
          type: QuestionType.MATH_PUZZLE,
          theme: QuestionTheme.MATH,
          difficulty: QuestionDifficulty.EASY,
          text: "Complétez l'équation.",
          equation: "12 + ? = 15",
          mathGrid: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          correctAnswer: "3"
      },
      {
          id: 'math-2',
          type: QuestionType.MATH_PUZZLE,
          theme: QuestionTheme.MATH,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Quel est le résultat ?",
          equation: "8 x 7 = ?",
          mathGrid: [48, 54, 56, 64, 42, 49],
          correctAnswer: "56"
      }
  ],
  [QuestionType.REBUS]: [
      {
          id: 'rebus-1',
          type: QuestionType.REBUS,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Déchiffrez ce rébus.",
          rebusEmojis: "👑🐝",
          correctAnswer: "Reine des abeilles"
      },
      {
          id: 'rebus-2',
          type: QuestionType.REBUS,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.HARD,
          text: "Expression connue.",
          rebusEmojis: "👁️❤️☕",
          correctAnswer: "I love coffee"
      }
  ],
  [QuestionType.ODD_ONE_OUT]: [
      {
          id: 'odd-1',
          type: QuestionType.ODD_ONE_OUT,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.EASY,
          text: "Trouvez l'intrus parmi ces éléments.",
          oddOneOutItems: [
              { id: '1', content: 'Chien', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', isOdd: false },
              { id: '2', content: 'Chat', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', isOdd: false },
              { id: '3', content: 'Voiture', imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200', isOdd: true },
              { id: '4', content: 'Oiseau', imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd8?w=200', isOdd: false },
          ],
          correctAnswer: '3'
      },
      {
          id: 'odd-2',
          type: QuestionType.ODD_ONE_OUT,
          theme: QuestionTheme.GEO,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Lequel n'est pas en Europe ?",
          oddOneOutItems: [
              { id: '1', content: 'France', isOdd: false },
              { id: '2', content: 'Espagne', isOdd: false },
              { id: '3', content: 'Brésil', isOdd: true },
              { id: '4', content: 'Italie', isOdd: false },
          ],
          correctAnswer: '3'
      }
  ],
  [QuestionType.WORD_GUESS]: [
      {
          id: 'word-1',
          type: QuestionType.WORD_GUESS,
          theme: QuestionTheme.CULTURE,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Trouvez le mot de 5 lettres (Animal).",
          wordLength: 5,
          correctAnswer: "TIGRE"
      },
      {
          id: 'word-2',
          type: QuestionType.WORD_GUESS,
          theme: QuestionTheme.SPORT,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Sport de combat (4 lettres).",
          wordLength: 4,
          correctAnswer: "BOXE"
      }
  ],
  [QuestionType.DIFFERENCES]: [
      {
          id: 'diff-1',
          type: QuestionType.DIFFERENCES,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.EASY,
          text: "Trouvez l'erreur dans l'image de droite.",
          // Specific Unsplash IDs to ensure loading
          diffImageLeft: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=400", 
          diffImageRight: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=400",
          diffTarget: { x: 50, y: 50, tolerance: 20 },
          correctAnswer: { x: 50, y: 50 }
      },
      {
          id: 'diff-2',
          type: QuestionType.DIFFERENCES,
          theme: QuestionTheme.NATURE,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Où est la différence ?",
          diffImageLeft: "https://images.unsplash.com/photo-1555685812-4b943f3e9942?q=80&w=400",
          diffImageRight: "https://images.unsplash.com/photo-1555685812-4b943f3e9942?q=80&w=400",
          diffTarget: { x: 20, y: 30, tolerance: 15 },
          correctAnswer: { x: 20, y: 30 }
      }
  ],
  [QuestionType.PATTERN]: [
      {
          id: 'pat-1',
          type: QuestionType.PATTERN,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.HARD,
          text: "Complétez la suite logique.",
          // Using placehold.co with shapes to simulate IQ test
          patternGridImage: "https://placehold.co/400x300/white/black?text=Pattern+Sequence",
          patternOptions: [
              { id: 'A', imageUrl: 'https://placehold.co/100x100/white/black?text=▲' },
              { id: 'B', imageUrl: 'https://placehold.co/100x100/white/black?text=●' },
              { id: 'C', imageUrl: 'https://placehold.co/100x100/white/black?text=■' },
              { id: 'D', imageUrl: 'https://placehold.co/100x100/white/black?text=◆' },
              { id: 'E', imageUrl: 'https://placehold.co/100x100/white/black?text=★' },
              { id: 'F', imageUrl: 'https://placehold.co/100x100/white/black?text=▼' },
          ],
          correctAnswer: "E"
      },
      {
          id: 'pat-2',
          type: QuestionType.PATTERN,
          theme: QuestionTheme.LOGIC,
          difficulty: QuestionDifficulty.MEDIUM,
          text: "Quel symbole manque ?",
          patternGridImage: "https://placehold.co/400x300/white/black?text=1...2...?",
          patternOptions: [
              { id: '1', imageUrl: 'https://placehold.co/100x100/white/black?text=3' },
              { id: '2', imageUrl: 'https://placehold.co/100x100/white/black?text=4' },
              { id: '3', imageUrl: 'https://placehold.co/100x100/white/black?text=5' },
          ],
          correctAnswer: "1"
      }
  ],
  [QuestionType.SIMON]: [] // Legacy
};

const TYPE_INFO = {
  [QuestionType.MCQ]: { label: "QCM Classique", icon: ListOrdered, desc: "Choisissez la bonne réponse parmi 4 propositions." },
  [QuestionType.CHESS]: { label: "Jeu d'échecs", icon: Crown, desc: "Trouvez le meilleur coup (Mat, tactique) sur l'échiquier." },
  [QuestionType.MATCHING]: { label: "Association", icon: MousePointerClick, desc: "Reliez des éléments par paires (Texte/Image) via Clic ou Drag & Drop." },
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
  [QuestionType.WORD_GUESS]: { label: "Mot Mystère", icon: SpellCheck, desc: "Devinez le mot secret en 6 essais (Type Wordle)." },
  [QuestionType.DIFFERENCES]: { label: "7 Erreurs", icon: ScanSearch, desc: "Trouvez la différence entre les deux images." },
  [QuestionType.PATTERN]: { label: "Suite Logique", icon: BoxSelect, desc: "Complétez la suite visuelle (Test de QI)." },
};

export const QuizTypes: React.FC = () => {
  const [activeType, setActiveType] = useState<QuestionType | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [validationResult, setValidationResult] = useState<'correct' | 'incorrect' | null>(null);

  const questionList = activeType ? DEMO_SAMPLES[activeType] : [];
  const currentQ = questionList[exampleIndex % questionList.length];

  const resetPlayground = () => {
    setSelectedAnswer(null);
    setInputValue("");
    setValidationResult(null);
    
    if (currentQ?.type === QuestionType.MATCHING) setSelectedAnswer({});
    if (currentQ?.type === QuestionType.ORDER && currentQ.items) {
       const scrambled = [...currentQ.items].sort(() => Math.random() - 0.5);
       setSelectedAnswer(scrambled.map(i => i.id));
    }
    if (currentQ?.type === QuestionType.SLIDER) {
        setSelectedAnswer(Math.floor(((currentQ.min || 0) + (currentQ.max || 100)) / 2));
    }
    if (currentQ?.type === QuestionType.SORTING) {
        setSelectedAnswer({});
    }
  };

  const openDemo = (type: QuestionType) => {
    setActiveType(type);
    setExampleIndex(0);
    setTimeout(resetPlayground, 50);
  };

  const nextExample = () => {
      setExampleIndex(prev => prev + 1);
      setTimeout(resetPlayground, 50);
  };

  const validate = () => {
    if (!currentQ) return;
    let isCorrect = false;

    switch (currentQ.type) {
        case QuestionType.MCQ:
        case QuestionType.IMAGE_MCQ:
        case QuestionType.BLIND_TEST:
        case QuestionType.ODD_ONE_OUT:
        case QuestionType.PATTERN:
            isCorrect = selectedAnswer === currentQ.correctAnswer;
            break;
        case QuestionType.INPUT:
        case QuestionType.PIXEL_REVEAL:
        case QuestionType.MATH_PUZZLE:
        case QuestionType.REBUS:
        case QuestionType.WORD_GUESS:
            const userVal = inputValue.trim().toLowerCase();
            const correctVal = (currentQ.correctAnswer as string).toLowerCase();
            isCorrect = userVal === correctVal;
            break;
        case QuestionType.SLIDER:
            const val = Number(selectedAnswer);
            const target = Number(currentQ.correctAnswer);
            const tolerance = currentQ.tolerance || 0;
            isCorrect = Math.abs(val - target) <= tolerance;
            break;
        case QuestionType.MATCHING:
             const matches = selectedAnswer as Record<string, string>;
             const pairs = currentQ.pairs || [];
             if (Object.keys(matches).length === pairs.length) {
                 isCorrect = pairs.every(p => matches[p.left] === p.right);
             }
             break;
        case QuestionType.ORDER:
             isCorrect = JSON.stringify(selectedAnswer) === JSON.stringify(currentQ.correctAnswer);
             break;
        case QuestionType.SORTING:
             const sortResults = selectedAnswer as Record<string, string>;
             const items = currentQ.sortingItems || [];
             if (Object.keys(sortResults).length === items.length) {
                 isCorrect = items.every(item => sortResults[item.id] === item.correctGroupId);
             }
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
        case QuestionType.ANAGRAM:
            isCorrect = selectedAnswer === currentQ.correctAnswer;
            break;
        default: break;
    }
    setValidationResult(isCorrect ? 'correct' : 'incorrect');
  };

  const handleComplexResult = (result: any) => {
      setValidationResult('correct');
  };

  const handleChessResult = (isCorrect: boolean) => {
      setValidationResult(isCorrect ? 'correct' : 'incorrect');
  };

  // Helper to check if type validates automatically
  const isAutoValidating = [QuestionType.CHESS, QuestionType.CONNECTIONS].includes(activeType as QuestionType);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-12">
        <div className="text-center mb-10 pt-4">
            <h2 className="font-display text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
                <Library className="text-blue-500" size={40} />
                Catalogue des Quizz
            </h2>
            <p className="text-slate-500 text-lg">Découvrez et testez tous les formats de questions disponibles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {Object.entries(TYPE_INFO).map(([typeStr, info]) => {
                const type = typeStr as QuestionType;
                const Icon = info.icon;
                const isActive = activeType === type;

                if (type === QuestionType.SIMON) return null; // Skip legacy

                return (
                    <button 
                        key={type}
                        onClick={() => openDemo(type)}
                        className={`bg-white p-6 rounded-3xl border-4 text-left transition-all group relative overflow-hidden ${
                            isActive 
                            ? 'border-blue-500 shadow-xl scale-105 ring-4 ring-blue-100 z-10' 
                            : 'border-slate-100 hover:border-blue-300 hover:shadow-lg'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'}`}>
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
            <div id="playground" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setActiveType(null)}></div>

                <div className="bg-white rounded-[40px] w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col relative z-10 overflow-hidden animate-in zoom-in-95">
                    
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                        <div>
                            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Zone de Test</div>
                            <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
                                {TYPE_INFO[activeType].label}
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            {questionList.length > 1 && (
                                <button 
                                    onClick={nextExample}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center gap-2"
                                >
                                    <Shuffle size={16} /> <span className="hidden sm:inline">Exemple Suivant</span>
                                </button>
                            )}
                            <button 
                                onClick={() => setActiveType(null)} 
                                className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    <div className={`p-6 md:p-10 flex-1 ${activeType === QuestionType.CHESS ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
                         <div className="flex items-center justify-center mb-2">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Thème : {currentQ.theme}
                            </span>
                         </div>
                         <h4 className="text-2xl font-bold text-slate-800 mb-8 text-center">{currentQ.text}</h4>
                         
                         {currentQ.imageUrl && ![QuestionType.HOTSPOT, QuestionType.PIXEL_REVEAL, QuestionType.PATTERN].includes(activeType) && (
                            <div className="flex justify-center mb-8">
                                <img 
                                    src={currentQ.imageUrl} 
                                    className="max-h-48 rounded-xl shadow-lg object-contain border-4 border-white" 
                                    alt="Context" 
                                />
                            </div>
                         )}

                         <div className="mb-8">
                            {(activeType === QuestionType.MCQ || activeType === QuestionType.IMAGE_MCQ) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQ.options?.map(opt => (
                                        <button 
                                            key={opt} 
                                            onClick={() => setSelectedAnswer(opt)}
                                            className={`p-6 rounded-2xl border-2 font-bold text-lg text-left transition-all ${
                                                selectedAnswer === opt 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeType === QuestionType.INPUT && (
                                <div className="max-w-md mx-auto">
                                    <input 
                                        className="w-full p-6 text-3xl font-bold text-center border-4 border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-colors placeholder:text-slate-300 text-slate-700" 
                                        value={inputValue} 
                                        onChange={(e) => setInputValue(e.target.value)} 
                                        placeholder="Tapez ici..."
                                        autoFocus
                                    />
                                </div>
                            )}

                            {activeType === QuestionType.CHESS && (
                                <div className="flex justify-center w-full">
                                   <ChessQuestion question={currentQ} onAnswer={handleChessResult} />
                                </div>
                            )}

                            {activeType === QuestionType.MATCHING && (
                                <MatchingQuestion question={currentQ} onMatchChange={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.ORDER && (
                                <OrderQuestion question={currentQ} onOrderChange={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.SLIDER && (
                                <SliderQuestion question={currentQ} onValueChange={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.SORTING && (
                                <SortingQuestion question={currentQ} onSortComplete={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.HOTSPOT && (
                                <HotspotQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.HOLE_TEXT && (
                                <HoleTextQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.BLIND_TEST && (
                                <BlindTestQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.TRUE_FALSE && (
                                <TrueFalseQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.CONNECTIONS && (
                                <ConnectionsQuestion question={currentQ} onAnswer={handleComplexResult} />
                            )}

                            {activeType === QuestionType.ANAGRAM && (
                                <AnagramQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.PIXEL_REVEAL && (
                                <PixelRevealQuestion question={currentQ} onAnswer={setInputValue} />
                            )}

                            {activeType === QuestionType.MATH_PUZZLE && (
                                <MathPuzzleQuestion question={currentQ} onAnswer={setInputValue} />
                            )}

                            {activeType === QuestionType.REBUS && (
                                <RebusQuestion question={currentQ} onAnswer={setInputValue} />
                            )}

                            {activeType === QuestionType.ODD_ONE_OUT && (
                                <OddOneOutQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.WORD_GUESS && (
                                <WordGuessQuestion question={currentQ} onAnswer={setInputValue} />
                            )}

                            {activeType === QuestionType.DIFFERENCES && (
                                <DifferencesQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}

                            {activeType === QuestionType.PATTERN && (
                                <PatternQuestion question={currentQ} onAnswer={setSelectedAnswer} />
                            )}
                         </div>

                         {validationResult && (
                             <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold mb-6 animate-in zoom-in-95 ${
                                 validationResult === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                             }`}>
                                {validationResult === 'correct' ? <Check size={28} strokeWidth={3} /> : <X size={28} strokeWidth={3} />}
                                {validationResult === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse, essayez encore.'}
                             </div>
                         )}
                    </div>

                    {!isAutoValidating && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                            <Button fullWidth onClick={validate} size="lg" disabled={validationResult === 'correct'}>
                                Valider
                            </Button>
                            <Button variant="outline" onClick={resetPlayground} className="gap-2 px-6">
                                <RotateCcw size={20}/>
                            </Button>
                        </div>
                    )}
                     {isAutoValidating && (
                         <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center text-slate-400 text-sm font-bold shrink-0">
                            Résolvez le puzzle pour valider.
                         </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};
