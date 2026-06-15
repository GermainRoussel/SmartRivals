
import React from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '../../store';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Home, Brain, Swords, Trophy, User, Library } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const mobileNavItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/daily', icon: Brain, label: 'Quizz' },
    { path: '/multiplayer', icon: Swords, label: 'Versus' },
    { path: '/types', icon: Library, label: 'Types' },
    { path: '/leaderboard', icon: Trophy, label: 'Top' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Fixed */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-area-pb">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
             <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all duration-200 ${isActive ? 'text-primary bg-blue-50 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
             </Link>
          )
        })}
      </div>
    </div>
  );
};
