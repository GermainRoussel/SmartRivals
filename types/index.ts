
export enum QuestionType {
  MCQ = 'MCQ',
  INPUT = 'INPUT',
  CHESS = 'CHESS',
  ORDER = 'ORDER',
  IMAGE_MCQ = 'IMAGE_MCQ',
  MATCHING = 'MATCHING',
  SLIDER = 'SLIDER',
  SORTING = 'SORTING',
  HOTSPOT = 'HOTSPOT',
  HOLE_TEXT = 'HOLE_TEXT',
  BLIND_TEST = 'BLIND_TEST',
  TRUE_FALSE = 'TRUE_FALSE',
  CONNECTIONS = 'CONNECTIONS',
  ANAGRAM = 'ANAGRAM',
  PIXEL_REVEAL = 'PIXEL_REVEAL',
  MATH_PUZZLE = 'MATH_PUZZLE',
  REBUS = 'REBUS',
  ODD_ONE_OUT = 'ODD_ONE_OUT',
  WORD_GUESS = 'WORD_GUESS',   // New: Wordle style
  DIFFERENCES = 'DIFFERENCES', // New: 7 Errors
  PATTERN = 'PATTERN',         // New: IQ Logic Pattern
  SIMON = 'SIMON',             // Legacy
}

export enum QuestionTheme {
  HISTORY = 'Histoire',
  MATH = 'Mathématiques',
  GEO = 'Géographie',
  SCIENCE = 'Science',
  CULTURE = 'Culture G',
  GAMES = 'Jeux Vidéo',
  LOGIC = 'Logique',
  CHESS_STRATEGY = 'Stratégie Échecs',
  SPORT = 'Sport',
  ART = 'Art & Littérature',
  CINEMA = 'Cinéma',
  NATURE = 'Nature',
  NUTRITION = 'Nutrition',
  MUSIC = 'Musique',
  CARS = 'Automobile'
}

export enum QuestionDifficulty {
  EASY = 'Facile',
  MEDIUM = 'Moyen',
  HARD = 'Difficile',
  EXPERT = 'Expert'
}

export interface Question {
  id: string;
  type: QuestionType;
  theme: QuestionTheme;
  difficulty: QuestionDifficulty;
  text: string;
  
  // Specific fields based on type
  options?: string[]; // For MCQ, Blind Test
  imageOptions?: { id: string; url: string; label: string }[]; // For Image MCQ
  correctAnswer?: string | string[] | Record<string, string> | number | { x: number; y: number } | boolean | string[][] | { id: string }[]; // Flexible answer type
  fen?: string; // For Chess
  items?: { id: string; content: string }[]; // For Order
  imageUrl?: string; // Context image for the question
  audioUrl?: string; // For Blind Test (legacy external file — unused)
  soundId?: string; // For Blind Test (synthesised sound, see lib/audio.ts)
  
  // Matching
  pairs?: { left: string; right: string }[]; 
  
  // Slider
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  tolerance?: number;

  // Sorting
  groups?: { id: string; label: string; color?: string }[];
  sortingItems?: { id: string; content: string; correctGroupId: string; imageUrl?: string }[];

  // Hotspot
  hotspotTarget?: { x: number; y: number; tolerance?: number }; // x,y in % (0-100)

  // Hole Text
  holeText?: string;

  // Connections
  connectionsGroups?: { id: string; label: string; items: string[] }[]; // Groups of 4 items

  // Anagram
  anagramWord?: string; // The target word

  // Pixel Reveal
  pixelImage?: string;

  // Math Puzzle
  equation?: string; // e.g., "12 + ? = 15"
  mathGrid?: (number | string)[];

  // Rebus
  rebusEmojis?: string; // e.g. "👁️❤️☕"

  // Odd One Out
  oddOneOutItems?: { id: string; content: string; imageUrl?: string; isOdd: boolean }[];

  // Memory
  memoryPairs?: { id: string; content: string; type: 'text' | 'image' }[];

  // Simon
  simonSequence?: string[];

  // Word Guess (New)
  wordLength?: number; // e.g. 5

  // Differences (New)
  diffImageLeft?: string;
  diffImageRight?: string;
  diffTarget?: { x: number; y: number; tolerance?: number };

  // Pattern (New)
  patternGridImage?: string; // The main grid with a hole
  patternOptions?: { id: string; imageUrl: string }[]; // The options to fill the hole
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  rank: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: Record<string, unknown>;
  isFinished: boolean;
  streak: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  time: string;
  avatar: string;
}
