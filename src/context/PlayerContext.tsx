'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Player, PlayerStats, DEFAULT_STATS } from '@/lib/types';
import { getStoredPlayers, setStoredPlayers, generateId } from '@/lib/storage';

interface PlayerContextType {
  players: Player[];
  isLoading: boolean;
  addPlayer: (name: string, stats?: PlayerStats, image?: string) => Player;
  updatePlayer: (
    id: string,
    updates: Partial<Omit<Player, 'id' | 'createdAt'>>
  ) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load players from localStorage on mount
  useEffect(() => {
    const stored = getStoredPlayers();
    setPlayers(stored);
    setIsLoading(false);
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      setStoredPlayers(players);
    }
  }, [players, isLoading]);

  const addPlayer = useCallback(
    (name: string, stats?: PlayerStats, image?: string): Player => {
      const newPlayer: Player = {
        id: generateId(),
        name,
        image,
        stats: stats || DEFAULT_STATS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPlayers((prev) => [...prev, newPlayer]);
      return newPlayer;
    },
    []
  );

  const updatePlayer = useCallback(
    (
      id: string,
      updates: Partial<Omit<Player, 'id' | 'createdAt'>>
    ): void => {
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === id
            ? { ...player, ...updates, updatedAt: new Date().toISOString() }
            : player
        )
      );
    },
    []
  );

  const deletePlayer = useCallback((id: string): void => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }, []);

  const getPlayer = useCallback(
    (id: string): Player | undefined => {
      return players.find((p) => p.id === id);
    },
    [players]
  );

  return (
    <PlayerContext.Provider
      value={{
        players,
        isLoading,
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayers() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
}
