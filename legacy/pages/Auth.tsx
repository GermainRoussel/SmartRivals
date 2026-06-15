
import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export const Auth: React.FC = () => {
  const [username, setUsername] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-blue-100">
        {/* Logo Section */}
        <div className="flex justify-center mb-2">
             <Logo className="w-full max-w-[280px] h-auto" />
        </div>

        {/* Brand Name Title */}
        <div className="font-['Poppins'] text-4xl font-extrabold tracking-tighter flex flex-row items-baseline justify-center gap-[2px] mb-6 leading-none select-none">
            <span className="relative">
              <span className="text-[#8bd8ee]">S</span>
              <span className="text-black">mart</span>
            </span>
            <span className="relative">
              <span className="text-[#fcd172]">R</span>
              <span className="text-black">ivals</span>
            </span>
        </div>
        
        <p className="text-slate-500 mb-8 font-medium">Prêt pour votre duel cérébral quotidien ?</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: GigaBrain2024"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <Button fullWidth size="lg" type="submit">
            Se connecter / S'inscrire
          </Button>
        </form>
        <p className="mt-6 text-xs text-slate-400">
          En continuant, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
};
