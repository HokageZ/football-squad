'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useTransition,
  ReactNode,
} from 'react';
import { Player, PlayerStats, PlayerPosition, DEFAULT_STATS } from '@/lib/types';
import { getStoredPlayers, setStoredPlayers, generateId } from '@/lib/storage';

interface PlayerContextType {
  players: Player[];
  isLoading: boolean;
  addPlayer: (name: string, stats?: PlayerStats, image?: string, isUnknown?: boolean, position?: PlayerPosition) => Player;
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
  const [, startTransition] = useTransition();

  // Load players from localStorage on mount and migrate data if needed
  useEffect(() => {
    const stored = getStoredPlayers();
    
    // Migration: Convert 1-10 scale to 1-100 scale
    const migrated = stored.map(p => {
      // Check if stats are likely in 1-10 range (e.g., max stat is <= 10)
      const maxStat = Math.max(...Object.values(p.stats));
      if (maxStat <= 10 && maxStat > 0) {
        const newStats = { ...p.stats };
        (Object.keys(newStats) as Array<keyof typeof newStats>).forEach(key => {
          newStats[key] = Math.min(99, Math.round(newStats[key] * 10));
        });
        return { ...p, stats: newStats };
      }
      return p;
    });

    setPlayers(migrated);
    setIsLoading(false);
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      setStoredPlayers(players);
    }
  }, [players, isLoading]);

  const addPlayer = useCallback(
    (name: string, stats?: PlayerStats, image?: string, isUnknown?: boolean, position?: PlayerPosition): Player => {
      const newPlayer: Player = {
        id: generateId(),
        name,
        image,
        position,
        stats: stats || DEFAULT_STATS,
        isUnknown,
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
    // Use startTransition for non-blocking UI updates
    startTransition(() => {
      setPlayers((prev) => prev.filter((player) => player.id !== id));
    });
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
