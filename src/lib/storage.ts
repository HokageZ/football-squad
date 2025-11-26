'use client';

import { Match, Player, Team } from './types';

const PLAYERS_KEY = 'football_squad_players';
const MATCHES_KEY = 'football_squad_matches';
const TEAMS_KEY = 'football_squad_teams';
const UNASSIGNED_KEY = 'football_squad_unassigned';

export function getStoredPlayers(): Player[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setStoredPlayers(players: Player[]): void {
  if (typeof window === 'undefined') return;
  
  // Defer localStorage write to not block the main thread
  requestAnimationFrame(() => {
    try {
      localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Failed to save players:', error);
    }
  });
}

export function getStoredMatches(): Match[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(MATCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setStoredMatches(matches: Match[]): void {
  if (typeof window === 'undefined') return;
  
  // Defer localStorage write to not block the main thread
  requestAnimationFrame(() => {
    try {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    } catch (error) {
      console.error('Failed to save matches:', error);
    }
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Team state persistence
export function getStoredTeams(): Team[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(TEAMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setStoredTeams(teams: Team[]): void {
  if (typeof window === 'undefined') return;
  
  requestAnimationFrame(() => {
    try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Failed to save teams:', error);
    }
  });
}

export function getStoredUnassigned(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(UNASSIGNED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setStoredUnassigned(playerIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  requestAnimationFrame(() => {
    try {
      localStorage.setItem(UNASSIGNED_KEY, JSON.stringify(playerIds));
    } catch (error) {
      console.error('Failed to save unassigned players:', error);
    }
  });
}
