
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Brain, Swords, User, Trophy, LogOut, Library } from 'lucide-react';
import { useStore } from '../../store';
import { Logo } from '../ui/Logo';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const logout = useStore(state => state.logout);
  
  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/daily', icon: Brain, label: 'Quizz du Jour' },
    { path: '/multiplayer', icon: Swords, label: 'Multijoueur' },
    { path: '/leaderboard', icon: Trophy, label: 'Classement' },
    { path: '/types', icon: Library, label: 'Types de Quizz' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <aside className="fixed hidden md:flex flex-col w-64 h-screen bg-white border-r border-blue-100 text-sidebar-text shadow-xl z-50">
      <div className="p-6 flex flex-col items-center">
        {/* Logo Container */}
        <div className="w-full mb-4 px-4">
           <Logo className="w-full h-auto max-h-28" />
        </div>
        
        {/* Brand Name - Styled exactly as requested: S(Blue)mart R(Yellow)ivals */}
        <div className="font-['Poppins'] text-3xl font-extrabold tracking-tighter flex flex-row items-baseline justify-center gap-[2px] mb-4 leading-none select-none">
            <span className="relative">
              <span className="text-[#8bd8ee]">S</span>
              <span className="text-black">mart</span>
            </span>
            <span className="relative">
              <span className="text-[#fcd172]">R</span>
              <span className="text-black">ivals</span>
            </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-display font-semibold ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm translate-x-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-1'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors font-bold"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
