import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Auth } from './pages/Auth';
import { DailyQuiz } from './pages/DailyQuiz';
import { Multiplayer } from './pages/Multiplayer';
import { Leaderboard } from './pages/Leaderboard';
import { QuizTypes } from './pages/QuizTypes';
import ChessGame from './pages/ChessGame';
import { useStore } from './store';
import { Button } from './components/ui/Button';
import { Logo } from './components/ui/Logo';

const Home = () => {
  const user = useStore(state => state.user);
  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto mt-4 pb-24 md:pb-0 px-4">
      {/* Hero Section */}
      <div className="bg-[#E0F2FE] rounded-[48px] p-8 md:p-16 text-center relative overflow-hidden border-4 border-white shadow-xl min-h-[400px] flex flex-col justify-center items-center w-full">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce delay-700 hidden md:block">⚡</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce hidden md:block">⭐</div>
        <div className="absolute top-10 right-20 text-blue-400 text-5xl rotate-12 hidden md:block">✦</div>
        
        <div className="relative z-10 flex flex-col items-center w-full">
          
          {/* Welcome Message */}
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-600 mb-2">
            Bienvenue <span className="text-blue-600">{user?.username || 'Joueur'}</span> !
          </h2>

          <div className="flex items-center justify-center mb-4 w-full">
             <Logo className="w-full max-w-[350px] h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500" />
          </div>

          {/* Brand Name Title */}
          <div className="font-['Poppins'] text-4xl md:text-6xl font-extrabold tracking-tighter flex flex-row items-baseline justify-center gap-[2px] mb-6 leading-none select-none drop-shadow-sm">
            <span className="relative">
              <span className="text-[#8bd8ee]">S</span>
              <span className="text-black">mart</span>
            </span>
            <span className="relative ml-2">
              <span className="text-[#fcd172]">R</span>
              <span className="text-black">ivals</span>
            </span>
          </div>
          
          <p className="text-lg md:text-2xl text-slate-600 font-medium mb-10 px-4 font-display max-w-2xl">
            Battle the brightest minds!
          </p>
          
          <Button 
            onClick={() => window.location.hash = '#/multiplayer'}
            size="lg" 
            className="bg-[#FCD34D] hover:bg-[#FBBF24] text-slate-900 border-b-8 border-[#F59E0B] text-xl md:text-2xl px-10 md:px-16 py-5 rounded-full shadow-xl active:border-b-0 active:translate-y-2 transition-all w-full md:w-auto"
          >
            Start a Match
          </Button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => window.location.hash = '#/daily'} 
          className="bg-white p-10 rounded-[40px] shadow-sm border-4 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden min-h-[200px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-sm">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="font-display font-bold text-3xl text-slate-800 mb-2">Quizz du Jour</h3>
            <p className="text-slate-500 font-medium text-lg">Challenge quotidien unique. Grimpez dans le classement !</p>
          </div>
        </div>

        <div 
          onClick={() => window.location.hash = '#/leaderboard'}
          className="bg-white p-10 rounded-[40px] shadow-sm border-4 border-slate-100 hover:border-yellow-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden min-h-[200px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform shadow-sm">
              <span className="text-4xl">🏆</span>
            </div>
            <h3 className="font-display font-bold text-3xl text-slate-800 mb-2">Classement</h3>
            <p className="text-slate-500 font-medium text-lg">Voir les meilleurs joueurs de la semaine.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
    const user = useStore(state => state.user);
    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center mt-4 max-w-3xl mx-auto">
            <img src={user?.avatar} className="w-32 h-32 rounded-full bg-slate-100 mb-4 border-4 border-white shadow-lg" />
            <h2 className="text-3xl font-display font-bold text-slate-800">{user?.username}</h2>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mt-2 shadow-sm">{user?.rank}</span>
            <div className="mt-8 w-full max-w-md grid grid-cols-2 gap-4 text-center">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-3xl font-black text-slate-800">125</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Parties jouées</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-3xl font-black text-slate-800">68%</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Victoires</div>
                </div>
            </div>
        </div>
    )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/daily" element={<Layout><DailyQuiz /></Layout>} />
        <Route path="/multiplayer" element={<Layout><Multiplayer /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
        <Route path="/types" element={<Layout><QuizTypes /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/chess" element={<ChessGame />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;