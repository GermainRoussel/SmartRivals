import {
  Question,
  QuestionType,
  QuestionTheme,
  QuestionDifficulty,
} from "@/types";
import { DIFFERENCE_SCENES } from "./differences";
import { PATTERN_PUZZLES } from "./patterns";

/**
 * Seeded question bank (Phase 1: in-code; Phase 2: mirrored into Supabase).
 * Each format ships at least two verified examples so the catalog and the
 * daily quiz can both draw from a single source.
 */
export const SAMPLES: Partial<Record<QuestionType, Question[]>> = {
  [QuestionType.MCQ]: [
    {
      id: "mcq-1",
      type: QuestionType.MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Quelle est la capitale de l'Australie ?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctAnswer: "Canberra",
    },
    {
      id: "mcq-2",
      type: QuestionType.MCQ,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel est le symbole chimique de l'Or ?",
      options: ["Au", "Ag", "Fe", "Go"],
      correctAnswer: "Au",
    },
  ],
  [QuestionType.CHESS]: [
    {
      id: "chess-1",
      type: QuestionType.CHESS,
      theme: QuestionTheme.CHESS_STRATEGY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Mat en 1 : Tour blanche.",
      fen: "6k1/3R4/6K1/8/8/8/8/8 w - - 0 1",
      correctAnswer: "D7-D8",
    },
    {
      id: "chess-2",
      type: QuestionType.CHESS,
      theme: QuestionTheme.CHESS_STRATEGY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Mat en 1 : Dame blanche.",
      fen: "k7/8/K7/8/8/8/5Q2/8 w - - 0 1",
      correctAnswer: "F2-F8",
    },
  ],
  [QuestionType.MATCHING]: [
    {
      id: "match-1",
      type: QuestionType.MATCHING,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Reliez le monument à sa ville.",
      pairs: [
        {
          left: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
          right: "Agra (Taj Mahal)",
        },
        {
          left: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=600",
          right: "Paris (Tour Eiffel)",
        },
        {
          left: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
          right: "Rome (Colisée)",
        },
        {
          left: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80",
          right: "Bangkok (Wat Arun)",
        },
      ],
    },
    {
      id: "match-2",
      type: QuestionType.MATCHING,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Reliez l'opération à son résultat.",
      pairs: [
        { left: "5 x 5", right: "25" },
        { left: "12 / 4", right: "3" },
        { left: "7 + 8", right: "15" },
        { left: "20 - 9", right: "11" },
      ],
    },
  ],
  [QuestionType.SLIDER]: [
    {
      id: "slider-1",
      type: QuestionType.SLIDER,
      theme: QuestionTheme.HISTORY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "En quelle année le Titanic a-t-il fait naufrage ?",
      min: 1900,
      max: 1930,
      step: 1,
      unit: "",
      correctAnswer: 1912,
      tolerance: 0,
    },
    {
      id: "slider-2",
      type: QuestionType.SLIDER,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.EASY,
      text: "Température d'ébullition de l'eau (°C) ?",
      min: 0,
      max: 200,
      step: 5,
      unit: "°C",
      correctAnswer: 100,
      tolerance: 5,
    },
  ],
  [QuestionType.ORDER]: [
    {
      id: "order-1",
      type: QuestionType.ORDER,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Classez ces planètes de la plus proche à la plus éloignée du Soleil.",
      items: [
        { id: "mercure", content: "Mercure" },
        { id: "venus", content: "Vénus" },
        { id: "terre", content: "Terre" },
        { id: "mars", content: "Mars" },
      ],
      correctAnswer: ["mercure", "venus", "terre", "mars"],
    },
    {
      id: "order-2",
      type: QuestionType.ORDER,
      theme: QuestionTheme.HISTORY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Classez ces événements chronologiquement.",
      items: [
        { id: "1", content: "Révolution Française" },
        { id: "2", content: "Chute de Rome" },
        { id: "3", content: "Premier pas sur la Lune" },
        { id: "4", content: "Découverte de l'Amérique" },
      ],
      correctAnswer: ["2", "4", "1", "3"],
    },
  ],
  [QuestionType.INPUT]: [
    {
      id: "input-1",
      type: QuestionType.INPUT,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.HARD,
      text: "Quelle est la suite : 2, 4, 8, 16, ... ?",
      correctAnswer: "32",
    },
    {
      id: "input-2",
      type: QuestionType.INPUT,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Je commence la nuit et je finis le matin. Qui suis-je ? (Lettre)",
      correctAnswer: "N",
    },
  ],
  [QuestionType.IMAGE_MCQ]: [
    {
      id: "image-mcq-1",
      type: QuestionType.IMAGE_MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.HARD,
      text: "À quel pays appartient ce drapeau ?",
      imageUrl: "https://flagcdn.com/w640/sc.png",
      options: ["Seychelles", "Maurice", "Fidji", "Tonga"],
      correctAnswer: "Seychelles",
    },
    {
      id: "image-mcq-2",
      type: QuestionType.IMAGE_MCQ,
      theme: QuestionTheme.ART,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Qui a peint cette œuvre ?",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
      options: ["Da Vinci", "Michel-Ange", "Raphaël", "Donatello"],
      correctAnswer: "Da Vinci",
    },
  ],
  [QuestionType.SORTING]: [
    {
      id: "sort-1",
      type: QuestionType.SORTING,
      theme: QuestionTheme.NUTRITION,
      difficulty: QuestionDifficulty.EASY,
      text: "Fruit ou Légume (au sens culinaire) ?",
      groups: [
        { id: "F", label: "Fruit" },
        { id: "L", label: "Légume" },
      ],
      sortingItems: [
        { id: "1", content: "Banane", correctGroupId: "F" },
        { id: "2", content: "Courgette", correctGroupId: "L" },
        { id: "3", content: "Pomme", correctGroupId: "F" },
        { id: "4", content: "Poireau", correctGroupId: "L" },
        { id: "5", content: "Fraise", correctGroupId: "F" },
      ],
    },
    {
      id: "sort-2",
      type: QuestionType.SORTING,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Marvel ou DC Comics ?",
      groups: [
        { id: "M", label: "Marvel", color: "red" },
        { id: "D", label: "DC", color: "blue" },
      ],
      sortingItems: [
        { id: "1", content: "Batman", correctGroupId: "D" },
        { id: "2", content: "Iron Man", correctGroupId: "M" },
        { id: "3", content: "Wonder Woman", correctGroupId: "D" },
        { id: "4", content: "Thor", correctGroupId: "M" },
        { id: "5", content: "Superman", correctGroupId: "D" },
      ],
    },
  ],
  [QuestionType.HOTSPOT]: [
    {
      id: "hotspot-1",
      type: QuestionType.HOTSPOT,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Où se trouve le Japon ?",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1000px-World_map_-_low_resolution.svg.png",
      hotspotTarget: { x: 86, y: 35, tolerance: 5 },
      correctAnswer: { x: 86, y: 35 },
    },
    {
      id: "hotspot-2",
      type: QuestionType.HOTSPOT,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.HARD,
      text: "Cliquez sur le fémur.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Human_skeleton_front_en.svg/640px-Human_skeleton_front_en.svg.png",
      hotspotTarget: { x: 35, y: 55, tolerance: 10 },
      correctAnswer: { x: 35, y: 55 },
    },
  ],
  [QuestionType.HOLE_TEXT]: [
    {
      id: "hole-1",
      type: QuestionType.HOLE_TEXT,
      theme: QuestionTheme.CINEMA,
      difficulty: QuestionDifficulty.EASY,
      text: "Complétez cette réplique culte de Star Wars.",
      holeText: "Non, je suis ton {père}.",
    },
    {
      id: "hole-2",
      type: QuestionType.HOLE_TEXT,
      theme: QuestionTheme.HISTORY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Complétez la phrase.",
      holeText: "Napoléon a été exilé sur l'île de {Sainte-Hélène} en {1815}.",
    },
  ],
  [QuestionType.BLIND_TEST]: [
    {
      id: "blind-1",
      type: QuestionType.BLIND_TEST,
      theme: QuestionTheme.MUSIC,
      difficulty: QuestionDifficulty.EASY,
      text: "Quel est ce son ?",
      soundId: "doorbell",
      options: ["Réveil", "Sonnette", "Klaxon", "Sirène"],
      correctAnswer: "Sonnette",
    },
    {
      id: "blind-2",
      type: QuestionType.BLIND_TEST,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel son d'urgence entends-tu ?",
      soundId: "siren",
      options: ["Sirène", "Téléphone", "Laser", "Klaxon"],
      correctAnswer: "Sirène",
    },
  ],
  [QuestionType.TRUE_FALSE]: [
    {
      id: "tf-1",
      type: QuestionType.TRUE_FALSE,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.EASY,
      text: "L'eau bout à 100°C au niveau de la mer.",
      correctAnswer: true,
    },
    {
      id: "tf-2",
      type: QuestionType.TRUE_FALSE,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Les tomates sont des légumes.",
      correctAnswer: false,
    },
  ],
  [QuestionType.CONNECTIONS]: [
    {
      id: "conn-1",
      type: QuestionType.CONNECTIONS,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.HARD,
      text: "Créez 4 groupes de 4 mots liés.",
      connectionsGroups: [
        { id: "A", label: "Planètes", items: ["Mars", "Vénus", "Jupiter", "Saturne"] },
        { id: "B", label: "Dieux Grecs", items: ["Zeus", "Héra", "Poséidon", "Hadès"] },
        { id: "C", label: "Barres Chocolatées", items: ["Mars", "Lion", "Twix", "Bounty"] },
        { id: "D", label: "Marques de Voiture", items: ["Ford", "Tesla", "Fiat", "Honda"] },
      ],
      correctAnswer: "COMPLEX_VALIDATION",
    },
    {
      id: "conn-2",
      type: QuestionType.CONNECTIONS,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Associez les éléments.",
      connectionsGroups: [
        { id: "A", label: "Feu", items: ["Flamme", "Brasier", "Incendie", "Étincelle"] },
        { id: "B", label: "Eau", items: ["Océan", "Rivière", "Pluie", "Lac"] },
        { id: "C", label: "Air", items: ["Vent", "Souffle", "Oxygène", "Nuage"] },
        { id: "D", label: "Terre", items: ["Sol", "Rocher", "Sable", "Montagne"] },
      ],
      correctAnswer: "COMPLEX_VALIDATION",
    },
  ],
  [QuestionType.ANAGRAM]: [
    {
      id: "ana-1",
      type: QuestionType.ANAGRAM,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Reconstituez le nom de ce pays.",
      anagramWord: "PORTUGAL",
      correctAnswer: "PORTUGAL",
    },
    {
      id: "ana-2",
      type: QuestionType.ANAGRAM,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.EASY,
      text: "Quel est cet animal ?",
      anagramWord: "ELEPHANT",
      correctAnswer: "ELEPHANT",
    },
  ],
  [QuestionType.PIXEL_REVEAL]: [
    {
      id: "pix-1",
      type: QuestionType.PIXEL_REVEAL,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Devinez l'animal avant que l'image ne soit nette !",
      pixelImage:
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
      correctAnswer: "LION",
    },
    {
      id: "pix-2",
      type: QuestionType.PIXEL_REVEAL,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.HARD,
      text: "Quelle est cette ville ?",
      pixelImage:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      correctAnswer: "PARIS",
    },
  ],
  [QuestionType.MATH_PUZZLE]: [
    {
      id: "math-1",
      type: QuestionType.MATH_PUZZLE,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Complétez l'équation.",
      equation: "12 + ? = 15",
      mathGrid: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      correctAnswer: "3",
    },
    {
      id: "math-2",
      type: QuestionType.MATH_PUZZLE,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel est le résultat ?",
      equation: "8 x 7 = ?",
      mathGrid: [48, 54, 56, 64, 42, 49],
      correctAnswer: "56",
    },
  ],
  [QuestionType.REBUS]: [
    {
      id: "rebus-1",
      type: QuestionType.REBUS,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Déchiffrez ce rébus.",
      rebusEmojis: "👑🐝",
      correctAnswer: "Reine des abeilles",
    },
    {
      id: "rebus-2",
      type: QuestionType.REBUS,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.HARD,
      text: "Expression connue.",
      rebusEmojis: "👁️❤️☕",
      correctAnswer: "I love coffee",
    },
  ],
  [QuestionType.ODD_ONE_OUT]: [
    {
      id: "odd-1",
      type: QuestionType.ODD_ONE_OUT,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.EASY,
      text: "Trouvez l'intrus parmi ces éléments.",
      oddOneOutItems: [
        { id: "1", content: "Chien", imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200", isOdd: false },
        { id: "2", content: "Chat", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200", isOdd: false },
        { id: "3", content: "Voiture", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200", isOdd: true },
        { id: "4", content: "Oiseau", imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30ebd8?w=200", isOdd: false },
      ],
      correctAnswer: "3",
    },
    {
      id: "odd-2",
      type: QuestionType.ODD_ONE_OUT,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Lequel n'est pas en Europe ?",
      oddOneOutItems: [
        { id: "1", content: "France", isOdd: false },
        { id: "2", content: "Espagne", isOdd: false },
        { id: "3", content: "Brésil", isOdd: true },
        { id: "4", content: "Italie", isOdd: false },
      ],
      correctAnswer: "3",
    },
  ],
  [QuestionType.WORD_GUESS]: [
    {
      id: "word-1",
      type: QuestionType.WORD_GUESS,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Trouvez le mot de 5 lettres (Animal).",
      wordLength: 5,
      correctAnswer: "TIGRE",
    },
    {
      id: "word-2",
      type: QuestionType.WORD_GUESS,
      theme: QuestionTheme.SPORT,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Sport de combat (4 lettres).",
      wordLength: 4,
      correctAnswer: "BOXE",
    },
  ],
  [QuestionType.DIFFERENCES]: [
    {
      id: "diff-1",
      type: QuestionType.DIFFERENCES,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.EASY,
      text: "Un ballon a changé de couleur. Cliquez dessus à droite.",
      diffImageLeft: DIFFERENCE_SCENES[0].left,
      diffImageRight: DIFFERENCE_SCENES[0].right,
      diffTarget: DIFFERENCE_SCENES[0].target,
      correctAnswer: { x: DIFFERENCE_SCENES[0].target.x, y: DIFFERENCE_SCENES[0].target.y },
    },
    {
      id: "diff-2",
      type: QuestionType.DIFFERENCES,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Une chose a disparu à droite. Cliquez à son emplacement.",
      diffImageLeft: DIFFERENCE_SCENES[1].left,
      diffImageRight: DIFFERENCE_SCENES[1].right,
      diffTarget: DIFFERENCE_SCENES[1].target,
      correctAnswer: { x: DIFFERENCE_SCENES[1].target.x, y: DIFFERENCE_SCENES[1].target.y },
    },
  ],
  [QuestionType.PATTERN]: [
    {
      id: "pat-1",
      type: QuestionType.PATTERN,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.EASY,
      text: "Combien de points dans la case manquante ?",
      patternGridImage: PATTERN_PUZZLES[0].grid,
      patternOptions: PATTERN_PUZZLES[0].options,
      correctAnswer: PATTERN_PUZZLES[0].correctId,
    },
    {
      id: "pat-2",
      type: QuestionType.PATTERN,
      theme: QuestionTheme.LOGIC,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quelle flèche complète la rotation ?",
      patternGridImage: PATTERN_PUZZLES[1].grid,
      patternOptions: PATTERN_PUZZLES[1].options,
      correctAnswer: PATTERN_PUZZLES[1].correctId,
    },
  ],
};

// ------------------------------------------------------------------ //
//  Extra questions (P4 content depth) — merged into SAMPLES below.     //
// ------------------------------------------------------------------ //
const EXTRA_SAMPLES: Partial<Record<QuestionType, Question[]>> = {
  [QuestionType.MCQ]: [
    {
      id: "mcq-3",
      type: QuestionType.MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Quel est le plus grand océan du monde ?",
      options: ["Atlantique", "Pacifique", "Indien", "Arctique"],
      correctAnswer: "Pacifique",
    },
    {
      id: "mcq-4",
      type: QuestionType.MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Quel pays a pour capitale Tokyo ?",
      options: ["Chine", "Corée du Sud", "Japon", "Thaïlande"],
      correctAnswer: "Japon",
    },
    {
      id: "mcq-5",
      type: QuestionType.MCQ,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quelle planète est la plus proche du Soleil ?",
      options: ["Vénus", "Mars", "Mercure", "Terre"],
      correctAnswer: "Mercure",
    },
  ],
  [QuestionType.TRUE_FALSE]: [
    {
      id: "tf-3",
      type: QuestionType.TRUE_FALSE,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.EASY,
      text: "Le Soleil est une étoile.",
      correctAnswer: true,
    },
    {
      id: "tf-4",
      type: QuestionType.TRUE_FALSE,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "La Grande Muraille de Chine est visible à l'œil nu depuis la Lune.",
      correctAnswer: false,
    },
    {
      id: "tf-5",
      type: QuestionType.TRUE_FALSE,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.EASY,
      text: "Une araignée a huit pattes.",
      correctAnswer: true,
    },
  ],
  [QuestionType.INPUT]: [
    {
      id: "input-3",
      type: QuestionType.INPUT,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Quelle est la capitale de l'Italie ?",
      correctAnswer: "Rome",
    },
    {
      id: "input-4",
      type: QuestionType.INPUT,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Combien font 7 × 8 ?",
      correctAnswer: "56",
    },
  ],
  [QuestionType.SLIDER]: [
    {
      id: "slider-3",
      type: QuestionType.SLIDER,
      theme: QuestionTheme.HISTORY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "En quelle année l'homme a-t-il marché sur la Lune ?",
      min: 1940,
      max: 2000,
      step: 1,
      unit: "",
      correctAnswer: 1969,
      tolerance: 0,
    },
    {
      id: "slider-4",
      type: QuestionType.SLIDER,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.EASY,
      text: "Température normale du corps humain (°C) ?",
      min: 30,
      max: 45,
      step: 1,
      unit: "°C",
      correctAnswer: 37,
      tolerance: 1,
    },
  ],
  [QuestionType.ANAGRAM]: [
    {
      id: "ana-3",
      type: QuestionType.ANAGRAM,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Reconstituez le nom de ce pays.",
      anagramWord: "FRANCE",
      correctAnswer: "FRANCE",
    },
    {
      id: "ana-4",
      type: QuestionType.ANAGRAM,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel est cet animal ?",
      anagramWord: "GIRAFE",
      correctAnswer: "GIRAFE",
    },
  ],
  [QuestionType.WORD_GUESS]: [
    {
      id: "word-3",
      type: QuestionType.WORD_GUESS,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Capitale de la France (5 lettres).",
      wordLength: 5,
      correctAnswer: "PARIS",
    },
    {
      id: "word-4",
      type: QuestionType.WORD_GUESS,
      theme: QuestionTheme.NUTRITION,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Plat italien rond (5 lettres).",
      wordLength: 5,
      correctAnswer: "PIZZA",
    },
  ],
  [QuestionType.MATH_PUZZLE]: [
    {
      id: "math-3",
      type: QuestionType.MATH_PUZZLE,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel est le résultat ?",
      equation: "9 × 6 = ?",
      mathGrid: [48, 54, 56, 63, 45, 52],
      correctAnswer: "54",
    },
    {
      id: "math-4",
      type: QuestionType.MATH_PUZZLE,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Complétez l'équation.",
      equation: "? + 15 = 40",
      mathGrid: [20, 25, 30, 15, 35, 10],
      correctAnswer: "25",
    },
  ],
  [QuestionType.ORDER]: [
    {
      id: "order-3",
      type: QuestionType.ORDER,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Classez ces nombres du plus petit au plus grand.",
      items: [
        { id: "12", content: "12" },
        { id: "3", content: "3" },
        { id: "7", content: "7" },
        { id: "5", content: "5" },
      ],
      correctAnswer: ["3", "5", "7", "12"],
    },
    {
      id: "order-4",
      type: QuestionType.ORDER,
      theme: QuestionTheme.SCIENCE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Classez ces unités de longueur, de la plus petite à la plus grande.",
      items: [
        { id: "km", content: "Kilomètre" },
        { id: "mm", content: "Millimètre" },
        { id: "m", content: "Mètre" },
        { id: "cm", content: "Centimètre" },
      ],
      correctAnswer: ["mm", "cm", "m", "km"],
    },
  ],
  [QuestionType.ODD_ONE_OUT]: [
    {
      id: "odd-3",
      type: QuestionType.ODD_ONE_OUT,
      theme: QuestionTheme.NUTRITION,
      difficulty: QuestionDifficulty.EASY,
      text: "Lequel n'est pas un fruit ?",
      oddOneOutItems: [
        { id: "1", content: "Pomme", isOdd: false },
        { id: "2", content: "Banane", isOdd: false },
        { id: "3", content: "Carotte", isOdd: true },
        { id: "4", content: "Fraise", isOdd: false },
      ],
      correctAnswer: "3",
    },
    {
      id: "odd-4",
      type: QuestionType.ODD_ONE_OUT,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Lequel n'est pas un mammifère ?",
      oddOneOutItems: [
        { id: "1", content: "Chien", isOdd: false },
        { id: "2", content: "Requin", isOdd: true },
        { id: "3", content: "Cheval", isOdd: false },
        { id: "4", content: "Dauphin", isOdd: false },
      ],
      correctAnswer: "2",
    },
  ],
  [QuestionType.MATCHING]: [
    {
      id: "match-3",
      type: QuestionType.MATCHING,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "Reliez le pays à sa capitale.",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Espagne", right: "Madrid" },
        { left: "Italie", right: "Rome" },
        { left: "Allemagne", right: "Berlin" },
      ],
    },
    {
      id: "match-4",
      type: QuestionType.MATCHING,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.EASY,
      text: "Reliez l'animal à son cri.",
      pairs: [
        { left: "Chat", right: "Miaulement" },
        { left: "Chien", right: "Aboiement" },
        { left: "Vache", right: "Meuglement" },
        { left: "Coq", right: "Cocorico" },
      ],
    },
  ],
  [QuestionType.SORTING]: [
    {
      id: "sort-3",
      type: QuestionType.SORTING,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Nombre pair ou impair ?",
      groups: [
        { id: "P", label: "Pair" },
        { id: "I", label: "Impair" },
      ],
      sortingItems: [
        { id: "1", content: "2", correctGroupId: "P" },
        { id: "2", content: "3", correctGroupId: "I" },
        { id: "3", content: "8", correctGroupId: "P" },
        { id: "4", content: "5", correctGroupId: "I" },
        { id: "5", content: "10", correctGroupId: "P" },
      ],
    },
    {
      id: "sort-4",
      type: QuestionType.SORTING,
      theme: QuestionTheme.NATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Animal terrestre ou marin ?",
      groups: [
        { id: "T", label: "Terrestre" },
        { id: "M", label: "Marin" },
      ],
      sortingItems: [
        { id: "1", content: "Lion", correctGroupId: "T" },
        { id: "2", content: "Requin", correctGroupId: "M" },
        { id: "3", content: "Éléphant", correctGroupId: "T" },
        { id: "4", content: "Dauphin", correctGroupId: "M" },
        { id: "5", content: "Loup", correctGroupId: "T" },
      ],
    },
  ],
  [QuestionType.HOLE_TEXT]: [
    {
      id: "hole-3",
      type: QuestionType.HOLE_TEXT,
      theme: QuestionTheme.MATH,
      difficulty: QuestionDifficulty.EASY,
      text: "Complétez avec les bons nombres.",
      holeText: "Un triangle a {3} côtés et un carré en a {4}.",
    },
    {
      id: "hole-4",
      type: QuestionType.HOLE_TEXT,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Complétez les capitales.",
      holeText: "La capitale de la France est {Paris} et celle de l'Espagne est {Madrid}.",
    },
  ],
  [QuestionType.CONNECTIONS]: [
    {
      id: "conn-3",
      type: QuestionType.CONNECTIONS,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Créez 4 groupes de 4 mots liés.",
      connectionsGroups: [
        { id: "A", label: "Couleurs", items: ["Rouge", "Bleu", "Vert", "Jaune"] },
        { id: "B", label: "Fruits", items: ["Pomme", "Poire", "Cerise", "Raisin"] },
        { id: "C", label: "Pays", items: ["France", "Espagne", "Italie", "Japon"] },
        { id: "D", label: "Sports", items: ["Tennis", "Foot", "Rugby", "Judo"] },
      ],
      correctAnswer: "COMPLEX_VALIDATION",
    },
  ],
  [QuestionType.BLIND_TEST]: [
    {
      id: "blind-3",
      type: QuestionType.BLIND_TEST,
      theme: QuestionTheme.CULTURE,
      difficulty: QuestionDifficulty.EASY,
      text: "Quel est ce son ?",
      soundId: "phone",
      options: ["Téléphone", "Sirène", "Laser", "Sonnette"],
      correctAnswer: "Téléphone",
    },
    {
      id: "blind-4",
      type: QuestionType.BLIND_TEST,
      theme: QuestionTheme.GAMES,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Quel son de jeu vidéo entends-tu ?",
      soundId: "laser",
      options: ["Laser", "Klaxon", "Réveil", "Téléphone"],
      correctAnswer: "Laser",
    },
  ],
  [QuestionType.IMAGE_MCQ]: [
    {
      id: "image-mcq-3",
      type: QuestionType.IMAGE_MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.EASY,
      text: "À quel pays appartient ce drapeau ?",
      imageUrl: "https://flagcdn.com/w640/jp.png",
      options: ["Japon", "Chine", "Corée du Sud", "Bangladesh"],
      correctAnswer: "Japon",
    },
    {
      id: "image-mcq-4",
      type: QuestionType.IMAGE_MCQ,
      theme: QuestionTheme.GEO,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "À quel pays appartient ce drapeau ?",
      imageUrl: "https://flagcdn.com/w640/br.png",
      options: ["Brésil", "Argentine", "Portugal", "Mexique"],
      correctAnswer: "Brésil",
    },
  ],
  [QuestionType.CHESS]: [
    {
      id: "chess-3",
      type: QuestionType.CHESS,
      theme: QuestionTheme.CHESS_STRATEGY,
      difficulty: QuestionDifficulty.EASY,
      text: "Mat en 1 : le mat du couloir.",
      fen: "6k1/5ppp/8/8/8/8/8/R6K w - - 0 1",
      correctAnswer: "A1-A8",
    },
    {
      id: "chess-4",
      type: QuestionType.CHESS,
      theme: QuestionTheme.CHESS_STRATEGY,
      difficulty: QuestionDifficulty.MEDIUM,
      text: "Mat en 1 : la dame soutenue par le roi.",
      fen: "7k/8/5K2/8/8/8/8/6Q1 w - - 0 1",
      correctAnswer: "G1-G7",
    },
  ],
};

// Merge the extras into the bank (one pass, at import time).
for (const key of Object.keys(EXTRA_SAMPLES) as QuestionType[]) {
  SAMPLES[key] = [...(SAMPLES[key] ?? []), ...EXTRA_SAMPLES[key]!];
}

/** All catalog formats, in display order. */
export const CATALOG_TYPES = Object.keys(SAMPLES) as QuestionType[];

/* ------------------------------------------------------------------ */
/*  Deterministic daily selection                                      */
/* ------------------------------------------------------------------ */

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** ISO date key (YYYY-MM-DD) used to seed the daily quiz. */
export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const ALL_QUESTIONS: Question[] = Object.values(SAMPLES).flat();
const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export function getQuestionsByIds(ids: string[]): Question[] {
  return ids
    .map((id) => QUESTION_BY_ID.get(id))
    .filter((q): q is Question => Boolean(q));
}

/**
 * Pick `count` question ids deterministically from `seed` — one per format,
 * so everyone sharing the seed (a day, a room) gets the same varied set.
 */
export function pickQuestionIds(seed: string, count = 10): string[] {
  const rng = mulberry32(hashString(seed));
  const types = seededShuffle(CATALOG_TYPES, rng).slice(0, count);
  return types.map((type) => {
    const pool = SAMPLES[type]!;
    return pool[Math.floor(rng() * pool.length)].id;
  });
}

export function getDailyQuestions(dateKey: string, count = 10): Question[] {
  return getQuestionsByIds(pickQuestionIds(dateKey, count));
}
