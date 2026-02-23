export interface PlayerStats {
  pace: number;
  shooting: number;
  dribbling: number;
  passing: number;
  defending: number;
  physical: number;
  goalkeeping: number;
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
  bench?: Player[];
  scoreA?: number;
  scoreB?: number;
  status: 'scheduled' | 'completed';
}

export type StatKey = keyof PlayerStats;

export const OUTFIELD_STAT_KEYS: StatKey[] = [
  'pace',
  'shooting',
  'dribbling',
  'passing',
  'defending',
  'physical',
];

export const STAT_KEYS: StatKey[] = [
  ...OUTFIELD_STAT_KEYS,
  'goalkeeping',
];

export const STAT_LABELS: Record<StatKey, string> = {
  pace: 'PAC',
  shooting: 'SHO',
  dribbling: 'DRI',
  passing: 'PAS',
  defending: 'DEF',
  physical: 'PHY',
  goalkeeping: 'GKP',
};

export const STAT_COLORS: Record<StatKey, string> = {
  pace: '#10b981', // Emerald
  shooting: '#ef4444', // Red
  dribbling: '#f59e0b', // Amber
  passing: '#3b82f6', // Blue
  defending: '#8b5cf6', // Violet
  physical: '#ec4899', // Pink
  goalkeeping: '#06b6d4', // Cyan
};

export const DEFAULT_STATS: PlayerStats = {
  pace: 60,
  shooting: 60,
  dribbling: 60,
  passing: 60,
  defending: 60,
  physical: 60,
  goalkeeping: 30,
};

export const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  pace: 'Speed & acceleration. How fast can the player sprint?',
  shooting: 'Finishing & shot power. How deadly in front of goal?',
  dribbling: 'Ball control & agility. How well do they handle the ball?',
  passing: 'Short & long passing accuracy. How well do they distribute?',
  defending: 'Tackling & interceptions. How solid are they defensively?',
  physical: 'Strength & stamina. How physical is the player?',
  goalkeeping: 'Shot stopping, positioning & reflexes. How good are they between the posts?',
};

// Position-based stat weights for calculating position-specific overall
export const POSITION_STAT_WEIGHTS: Record<PlayerPosition, Record<StatKey, number>> = {
  GK: { pace: 0.02, shooting: 0.01, dribbling: 0.02, passing: 0.05, defending: 0.02, physical: 0.03, goalkeeping: 0.85 },
  DEF: { pace: 0.15, shooting: 0.05, dribbling: 0.1, passing: 0.15, defending: 0.35, physical: 0.2, goalkeeping: 0 },
  MID: { pace: 0.1, shooting: 0.15, dribbling: 0.2, passing: 0.3, defending: 0.1, physical: 0.15, goalkeeping: 0 },
  ATT: { pace: 0.2, shooting: 0.3, dribbling: 0.25, passing: 0.1, defending: 0.05, physical: 0.1, goalkeeping: 0 },
};

// How much the overall rating is biased toward position-weighted stats (0 = pure average, 1 = fully position-weighted)
export const POSITION_OVERALL_BIAS: Record<PlayerPosition, number> = {
  GK: 0.7,
  DEF: 0.3,
  MID: 0.3,
  ATT: 0.3,
};

// Stat presets by skill level and position
export const STAT_PRESETS: Record<string, Record<PlayerPosition | 'ANY', PlayerStats>> = {
  Beginner: {
    ANY: { pace: 45, shooting: 42, dribbling: 40, passing: 43, defending: 44, physical: 46, goalkeeping: 25 },
    GK: { pace: 38, shooting: 30, dribbling: 35, passing: 42, defending: 48, physical: 47, goalkeeping: 48 },
    DEF: { pace: 44, shooting: 32, dribbling: 38, passing: 40, defending: 48, physical: 46, goalkeeping: 20 },
    MID: { pace: 42, shooting: 40, dribbling: 44, passing: 48, defending: 40, physical: 42, goalkeeping: 18 },
    ATT: { pace: 48, shooting: 46, dribbling: 44, passing: 38, defending: 30, physical: 40, goalkeeping: 15 },
  },
  Average: {
    ANY: { pace: 60, shooting: 58, dribbling: 57, passing: 59, defending: 58, physical: 60, goalkeeping: 30 },
    GK: { pace: 50, shooting: 40, dribbling: 48, passing: 58, defending: 65, physical: 62, goalkeeping: 62 },
    DEF: { pace: 58, shooting: 45, dribbling: 50, passing: 55, defending: 65, physical: 62, goalkeeping: 25 },
    MID: { pace: 57, shooting: 55, dribbling: 62, passing: 65, defending: 52, physical: 58, goalkeeping: 22 },
    ATT: { pace: 63, shooting: 65, dribbling: 60, passing: 52, defending: 40, physical: 55, goalkeeping: 20 },
  },
  Good: {
    ANY: { pace: 74, shooting: 72, dribbling: 73, passing: 74, defending: 73, physical: 75, goalkeeping: 35 },
    GK: { pace: 62, shooting: 48, dribbling: 60, passing: 72, defending: 80, physical: 78, goalkeeping: 78 },
    DEF: { pace: 72, shooting: 55, dribbling: 62, passing: 68, defending: 80, physical: 76, goalkeeping: 30 },
    MID: { pace: 70, shooting: 70, dribbling: 78, passing: 80, defending: 65, physical: 72, goalkeeping: 28 },
    ATT: { pace: 78, shooting: 80, dribbling: 76, passing: 65, defending: 48, physical: 68, goalkeeping: 25 },
  },
  Elite: {
    ANY: { pace: 88, shooting: 86, dribbling: 87, passing: 88, defending: 87, physical: 89, goalkeeping: 40 },
    GK: { pace: 75, shooting: 55, dribbling: 72, passing: 85, defending: 92, physical: 88, goalkeeping: 92 },
    DEF: { pace: 85, shooting: 65, dribbling: 75, passing: 82, defending: 92, physical: 88, goalkeeping: 35 },
    MID: { pace: 84, shooting: 82, dribbling: 90, passing: 92, defending: 78, physical: 85, goalkeeping: 32 },
    ATT: { pace: 92, shooting: 93, dribbling: 90, passing: 78, defending: 55, physical: 80, goalkeeping: 30 },
  },
};
