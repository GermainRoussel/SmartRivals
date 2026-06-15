import { create } from 'zustand';
import { User, QuizState } from './types';

interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
  
  // Quiz State
  quizState: QuizState;
  startQuiz: () => void;
  submitAnswer: (questionId: string, answer: any, isCorrect: boolean, timeRemaining: number) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

const INITIAL_QUIZ_STATE: QuizState = {
  currentQuestionIndex: 0,
  score: 0,
  answers: {},
  isFinished: false,
  streak: 0,
};

export const useStore = create<AppStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (username) => set({
    isAuthenticated: true,
    user: {
      id: '1',
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      xp: 1250,
      rank: 'Grand Master'
    }
  }),
  logout: () => set({ isAuthenticated: false, user: null }),

  quizState: INITIAL_QUIZ_STATE,
  startQuiz: () => set({ quizState: { ...INITIAL_QUIZ_STATE } }),
  
  submitAnswer: (questionId, answer, isCorrect, timeRemaining) => set((state) => {
    let pointsEarned = 0;
    // Logic: If correct, increment streak. If wrong, reset streak.
    let newStreak = isCorrect ? state.quizState.streak + 1 : 0;

    if (isCorrect) {
      // Base points
      const BASE_POINTS = 100;
      // Time bonus: 10 points per remaining second
      const TIME_BONUS = timeRemaining * 10;
      // Streak bonus: 20 points per streak level
      const STREAK_BONUS = (state.quizState.streak) * 20; 
      
      pointsEarned = BASE_POINTS + TIME_BONUS + STREAK_BONUS;
    }

    return {
      quizState: {
        ...state.quizState,
        score: state.quizState.score + pointsEarned,
        answers: { ...state.quizState.answers, [questionId]: answer },
        streak: newStreak
      }
    };
  }),

  nextQuestion: () => set((state) => ({
    quizState: {
      ...state.quizState,
      currentQuestionIndex: state.quizState.currentQuestionIndex + 1
    }
  })),
  
  resetQuiz: () => set({ quizState: INITIAL_QUIZ_STATE }),
}));