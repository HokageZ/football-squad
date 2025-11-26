export interface PlayerStats {
  pace: number;
  shooting: number;
  dribbling: number;
  passing: number;
  defending: number;
  physical: number;
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'ATT';

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  ATT: 'Attacker',
};

export const POSITION_COLORS: Record<PlayerPosition, string> = {
  GK: '#f59e0b', // Amber
  DEF: '#3b82f6', // Blue
  MID: '#10b981', // Emerald
  ATT: '#ef4444', // Red
};

export const POSITIONS: PlayerPosition[] = ['GK', 'DEF', 'MID', 'ATT'];

export interface Player {
  id: string;
  name: string;
  image?: string;
  position?: PlayerPosition;
  stats: PlayerStats;
  isUnknown?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  captainId?: string;
}

export interface Match {
  id: string;
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA?: number;
  scoreB?: number;
  status: 'scheduled' | 'completed';
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
  pace: '#10b981', // Emerald
  shooting: '#ef4444', // Red
  dribbling: '#f59e0b', // Amber
  passing: '#3b82f6', // Blue
  defending: '#8b5cf6', // Violet
  physical: '#ec4899', // Pink
};

export const DEFAULT_STATS: PlayerStats = {
  pace: 60,
  shooting: 60,
  dribbling: 60,
  passing: 60,
  defending: 60,
  physical: 60,
};
