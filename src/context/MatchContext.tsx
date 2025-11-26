'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Match, Team } from '@/lib/types';
import { getStoredMatches, setStoredMatches, generateId } from '@/lib/storage';

interface MatchContextType {
  matches: Match[];
  isLoading: boolean;
  addMatch: (teamA: Team, teamB: Team, date: string) => Match;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  getMatch: (id: string) => Match | undefined;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredMatches();
    setMatches(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setStoredMatches(matches);
    }
  }, [matches, isLoading]);

  const addMatch = useCallback(
    (teamA: Team, teamB: Team, date: string): Match => {
      const newMatch: Match = {
        id: generateId(),
        date,
        teamA,
        teamB,
        status: 'scheduled',
      };

      setMatches((prev) => [newMatch, ...prev]);
      return newMatch;
    },
    []
  );

  const updateMatch = useCallback(
    (id: string, updates: Partial<Match>): void => {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === id ? { ...match, ...updates } : match
        )
      );
    },
    []
  );

  const deleteMatch = useCallback((id: string): void => {
    setMatches((prev) => prev.filter((match) => match.id !== id));
  }, []);

  const getMatch = useCallback(
    (id: string): Match | undefined => {
      return matches.find((m) => m.id === id);
    },
    [matches]
  );

  return (
    <MatchContext.Provider
      value={{
        matches,
        isLoading,
        addMatch,
        updateMatch,
        deleteMatch,
        getMatch,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}
