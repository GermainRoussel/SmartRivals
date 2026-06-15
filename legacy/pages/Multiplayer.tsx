
import React, { useState, useEffect } from 'react';
import { useMultiplayerGame } from '../lib/mockSocket';
import { Button } from '../components/ui/Button';
import { Swords, Loader2, Users, KeyRound, Play, Trophy, Settings } from 'lucide-react';
import { useStore } from '../store';
import { GameSetup, GameSettings } from '../components/game/GameSetup';

type LobbyMode = 'menu' | 'create' | 'join' | 'playing' | 'setup' | 'configure_public' | 'configure_private';

interface Player {
    id: string;
    username: string;
    score: number;
    avatar: string;
    isMe: boolean;
}

export const Multiplayer: React.FC = () => {
  const { status, opponent, searchMatch, setStatus } = useMultiplayerGame();
  const user = useStore(state => state.user);
  const [mode, setMode] = useState<LobbyMode>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  
  // Mock Players State
  const [players, setPlayers] = useState<Player[]>([]);

  // Initialize players when game starts
  useEffect(() => {
      if (status === 'playing' && user && opponent) {
          setPlayers([
              { id: 'me', username: user.username, score: 0, avatar: user.avatar, isMe: true },
              { id: 'opp', username: opponent.name, score: 0, avatar: opponent.avatar, isMe: false },
              { id: 'bot', username: 'Bot_Speedy', score: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bot', isMe: false }
          ]);
          setQuestionIndex(1);
      }
  }, [status, user, opponent]);

  // Game Loop Simulation
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (status === 'playing') {
          setTimeLeft(15);
          interval = setInterval(() => {
              setTimeLeft((prev) => {
                  if (prev <= 1) {
                      // Next question logic simulation
                      if (questionIndex < 5) {
                        setQuestionIndex(q => q + 1);
                        return 15;
                      } else {
                        setStatus('finished'); // End game
                        return 0;
                      }
                  }
                  
                  // Random score updates for opponents to simulate live activity
                  if (Math.random() > 0.8) {
                      setPlayers(prev => prev.map(p => {
                          if (!p.isMe && Math.random() > 0.7) {
                              return { ...p, score: p.score + 115 }; // Simulate a good answer
                          }
                          return p;
                      }).sort((a, b) => b.score - a.score));
                  }
                  
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [status, questionIndex]);

  const startSearch = (settings: GameSettings) => {
      setGameSettings(settings);
      // Here you would pass settings to the backend search
      console.log("Searching with settings:", settings);
      setMode('menu'); // Reset mode just for visual cleanness before showing loader
      searchMatch();
  };

  const createRoom = (settings: GameSettings) => {
    setGameSettings(settings);
    // Here you would pass settings to create the room
    console.log("Creating room with settings:", settings);
    setMode('create');
    setTimeout(() => {
        setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
        setStatus('searching');
    }, 500);
  };

  const handleJoinRoom = () => {
    if (joinCode.length < 4) return;
    setMode('join');
    setStatus('searching');
    setTimeout(() => {
        setStatus('found');
        setTimeout(() => setStatus('playing'), 2000);
    }, 1500);
  };

  const handleAnswer = (optionIndex: number) => {
      // Mock scoring for self
      setPlayers(prev => prev.map(p => {
          if (p.isMe) {
              const timeBonus = timeLeft * 10;
              return { ...p, score: p.score + 100 + timeBonus };
          }
          return p;
      }).sort((a, b) => b.score - a.score));
  };

  // --- PLAYING VIEW ---
  if (status === 'playing') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto h-full">
         {/* Left: Live Leaderboard */}
         <div className="lg:col-span-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-fit">
            <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-yellow-500" />
                <h3 className="font-bold text-slate-700">Classement</h3>
            </div>
            <div className="space-y-4">
                {players.map((p, idx) => (
                    <div key={p.id} className={`flex items-center p-3 rounded-2xl ${p.isMe ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                        <div className={`font-black w-6 mr-2 ${idx === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>#{idx + 1}</div>
                        <img src={p.avatar} className="w-8 h-8 rounded-full mr-3 bg-white" />
                        <div className="flex-1">
                            <div className="text-xs font-bold truncate max-w-[80px]">{p.username}</div>
                            <div className="text-xs text-slate-500">{p.score} pts</div>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Center: Game Area */}
         <div className="lg:col-span-3">
             <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-b-8 border-slate-100 relative overflow-hidden">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 w-full h-3 bg-slate-100">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between items-center mt-2 mb-8">
                    <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full font-bold text-sm">
                        Question {questionIndex}/5
                    </span>
                    <div className="font-mono font-bold text-2xl text-slate-700">{timeLeft}s</div>
                </div>

                <p className="text-2xl font-bold text-slate-800 mb-10 h-20">En quelle année a été fondé Apple ?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 text-xl hover:bg-blue-50 hover:border-blue-300" onClick={() => handleAnswer(0)}>1974</Button>
                  <Button variant="outline" className="h-20 text-xl hover:bg-blue-50 hover:border-blue-300" onClick={() => handleAnswer(1)}>1976</Button>
                  <Button variant="outline" className="h-20 text-xl hover:bg-blue-50 hover:border-blue-300" onClick={() => handleAnswer(2)}>1984</Button>
                  <Button variant="outline" className="h-20 text-xl hover:bg-blue-50 hover:border-blue-300" onClick={() => handleAnswer(3)}>1990</Button>
                </div>
             </div>
         </div>
      </div>
    );
  }

  // --- CONFIGURATION VIEWS ---
  if (mode === 'configure_public') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
           <GameSetup onConfirm={startSearch} onCancel={() => setMode('menu')} confirmText="Rechercher" />
        </div>
      );
  }

  if (mode === 'configure_private') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
           <GameSetup onConfirm={createRoom} onCancel={() => setMode('setup')} confirmText="Créer la salle" />
        </div>
      );
  }

  // --- LOBBY/MENU VIEW ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-red-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner rotate-3">
          <Swords size={48} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-5xl font-bold text-slate-800 mb-3">Multijoueur</h2>
        <p className="text-xl text-slate-500 max-w-md mx-auto font-medium">Affrontez vos amis ou des joueurs du monde entier.</p>
      </div>

      {/* MAIN MENU */}
      {mode === 'menu' && status === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Public Match */}
            <button 
                onClick={() => setMode('configure_public')}
                className="group bg-white p-8 rounded-[32px] border-4 border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all text-left relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 bg-blue-50 w-32 h-32 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Users size={40} className="text-blue-500" />
                        <Settings size={20} className="text-slate-300 group-hover:text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Partie Publique</h3>
                    <p className="text-slate-500 font-medium">Choisir vos thèmes et trouver un adversaire.</p>
                </div>
            </button>

            {/* Private Room */}
            <button 
                onClick={() => setMode('setup')}
                className="group bg-white p-8 rounded-[32px] border-4 border-slate-100 hover:border-purple-400 hover:shadow-xl transition-all text-left relative overflow-hidden"
            >
                 <div className="absolute top-0 right-0 bg-purple-50 w-32 h-32 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <KeyRound size={40} className="text-purple-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Salle Privée</h3>
                    <p className="text-slate-500 font-medium">Créer une partie personnalisée ou rejoindre un ami.</p>
                </div>
            </button>
          </div>
      )}

      {/* CREATE ROOM VIEW */}
      {mode === 'create' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Votre Salle</h3>
              {roomCode ? (
                  <div className="bg-slate-100 p-6 rounded-2xl mb-8">
                      <p className="text-slate-500 text-sm uppercase font-bold tracking-wider mb-2">Code de la partie</p>
                      <p className="text-5xl font-display font-black text-slate-800 tracking-widest select-all">{roomCode}</p>
                  </div>
              ) : (
                  <Loader2 className="animate-spin mx-auto mb-8 text-slate-400" size={40} />
              )}
              
              <div className="flex items-center justify-center gap-3 text-slate-500 mb-8">
                  <Loader2 className="animate-spin" size={20} />
                  En attente d'un joueur...
              </div>

              {gameSettings && (
                  <div className="text-xs text-slate-400 mb-6">
                      Config: {gameSettings.difficulty} • {gameSettings.themes.length ? gameSettings.themes.join(', ') : 'Tout'}
                  </div>
              )}

              <Button variant="ghost" onClick={() => { setMode('menu'); setRoomCode(''); }}>Annuler</Button>
          </div>
      )}

      {/* SELECT JOIN/CREATE SUB-MENU */}
      {mode === 'setup' && (
           <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full">
               <Button fullWidth size="lg" className="mb-4" onClick={() => setMode('configure_private')}>Créer une salle</Button>
               <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 font-bold">OU</span>
                    <div className="flex-grow border-t border-slate-200"></div>
               </div>
               <div className="space-y-3">
                   <label className="block font-bold text-slate-700">Entrer un code</label>
                   <div className="flex gap-2">
                       <input 
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-xl uppercase placeholder:text-slate-300 focus:border-primary outline-none"
                            maxLength={6}
                       />
                       <Button onClick={handleJoinRoom} disabled={joinCode.length < 4}><Play fill="currentColor" /></Button>
                   </div>
               </div>
               <Button variant="ghost" fullWidth className="mt-6" onClick={() => setMode('menu')}>Retour</Button>
           </div>
      )}


      {/* SEARCHING / FOUND STATE */}
      {(status === 'searching' || status === 'found') && mode !== 'create' && (
        <div className="flex flex-col items-center bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in">
          {status === 'searching' && (
             <>
                <div className="relative w-20 h-20 mb-6">
                    <span className="absolute inset-0 rounded-full border-4 border-slate-100"></span>
                    <span className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Recherche en cours...</h3>
                <p className="font-medium text-slate-500 mb-6 text-center">
                    Nous cherchons un adversaire.
                    {gameSettings && <div className="text-xs mt-2 text-slate-400">Filtres actifs</div>}
                </p>
                <Button variant="ghost" onClick={() => { setStatus('idle'); setMode('menu'); }}>Annuler</Button>
             </>
          )}
          
          {status === 'found' && opponent && (
            <>
               <div className="text-center animate-bounce mb-6">
                    <div className="inline-block p-4 rounded-full bg-green-100 text-green-500 mb-4">
                        <Play size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Partie trouvée !</h3>
               </div>
               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl w-full mb-2">
                 <img src={opponent.avatar} className="w-14 h-14 rounded-full bg-white shadow-sm" />
                 <div>
                    <div className="font-bold text-lg text-slate-800">{opponent.name}</div>
                    <div className="text-sm text-slate-500">Niveau 12</div>
                 </div>
               </div>
               <div className="text-sm text-slate-400 font-bold mt-4">Lancement dans 3s...</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
