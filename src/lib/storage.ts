'use client';

import { Player } from './types';

const PLAYERS_KEY = 'football_squad_players';

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
  
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Failed to save players:', error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
