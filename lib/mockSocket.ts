// This is a simulation of the WebSocket service. 
// In production, this would use 'socket.io-client'.

import { useEffect, useState } from 'react';

type GameStatus = 'idle' | 'searching' | 'found' | 'playing' | 'finished';

export const useMultiplayerGame = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [opponent, setOpponent] = useState<{name: string, avatar: string} | null>(null);
  const [timer, setTimer] = useState(0);

  const searchMatch = () => {
    setStatus('searching');
    setTimeout(() => {
      setOpponent({
        name: "Rival_Player_99",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rival"
      });
      setStatus('found');
      setTimeout(() => setStatus('playing'), 2000);
    }, 3000);
  };

  return { status, opponent, searchMatch, setStatus };
};