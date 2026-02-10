'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Match, Team, Player } from '@/lib/types';
import { getStoredMatches, setStoredMatches, generateId } from '@/lib/storage';
import {
  scheduleMatchNotification,
  cancelMatchNotification,
  rescheduleAllNotifications,
  registerServiceWorker,
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/notifications';

interface MatchContextType {
  matches: Match[];
  isLoading: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  addMatch: (teamA: Team, teamB: Team, date: string, bench?: Player[]) => Match;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  getMatch: (id: string) => Match | undefined;
  requestNotifications: () => Promise<boolean>;
}

const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    const stored = getStoredMatches();
    setMatches(stored);
    setIsLoading(false);

    // Register service worker
    registerServiceWorker();

    // Check notification permission
    setNotificationPermission(getNotificationPermission());

    // Re-schedule pending notifications
    if (stored.length > 0) {
      rescheduleAllNotifications(stored);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setStoredMatches(matches);
    }
  }, [matches, isLoading]);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      // Schedule notifications for all upcoming matches
      matches
        .filter(m => m.status === 'scheduled')
        .forEach(m => scheduleMatchNotification(m));
    }
    return granted;
  }, [matches]);

  const addMatch = useCallback(
    (teamA: Team, teamB: Team, date: string, bench?: Player[]): Match => {
      const newMatch: Match = {
        id: generateId(),
        date,
        teamA,
        teamB,
        bench,
        status: 'scheduled',
      };

      setMatches((prev) => [newMatch, ...prev]);

      // Schedule notification
      scheduleMatchNotification(newMatch);

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
    cancelMatchNotification(id);
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
        notificationPermission,
        addMatch,
        updateMatch,
        deleteMatch,
        getMatch,
        requestNotifications,
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
