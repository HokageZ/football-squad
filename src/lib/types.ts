export interface PlayerStats {
  pace: number;
  shooting: number;
  dribbling: number;
  passing: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  image?: string;
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
}

export type StatKey = keyof PlayerStats;

export const STAT_KEYS: StatKey[] = [
  'pace',
  'shooting',
  'dribbling',
  'passing',
  'defending',
  'physical',
];

export const STAT_LABELS: Record<StatKey, string> = {
  pace: 'PAC',
  shooting: 'SHO',
  dribbling: 'DRI',
  passing: 'PAS',
  defending: 'DEF',
  physical: 'PHY',
};

export const STAT_COLORS: Record<StatKey, string> = {
  pace: '#22c55e',
  shooting: '#ef4444',
  dribbling: '#f59e0b',
  passing: '#3b82f6',
  defending: '#8b5cf6',
  physical: '#ec4899',
};

export const DEFAULT_STATS: PlayerStats = {
  pace: 5,
  shooting: 5,
  dribbling: 5,
  passing: 5,
  defending: 5,
  physical: 5,
};
