import { Player, PlayerStats, STAT_KEYS, Team } from './types';

export function calculateOverall(stats: PlayerStats): number {
  const total = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
  return Math.round((total / STAT_KEYS.length) * 10) / 10;
}

export function calculateTeamOverall(players: Player[]): number {
  if (players.length === 0) return 0;
  const total = players.reduce((sum, p) => sum + calculateOverall(p.stats), 0);
  return Math.round((total / players.length) * 10) / 10;
}

export function calculateTeamTotalOverall(players: Player[]): number {
  return players.reduce((sum, p) => sum + calculateOverall(p.stats), 0);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function balanceTeams(
  players: Player[],
  numTeams: number = 2
): Team[] {
  if (players.length === 0) {
    return createEmptyTeams(numTeams);
  }

  // Sort players by overall rating (descending)
  const sortedPlayers = [...players].sort(
    (a, b) => calculateOverall(b.stats) - calculateOverall(a.stats)
  );

  // Initialize teams
  const teams: Team[] = createEmptyTeams(numTeams);

  // Distribute players using snake draft pattern
  // This helps balance teams by alternating pick order
  let teamIndex = 0;
  let direction = 1;

  for (const player of sortedPlayers) {
    teams[teamIndex].players.push(player);
    
    // Snake draft: go forward then backward
    teamIndex += direction;
    
    if (teamIndex >= numTeams) {
      teamIndex = numTeams - 1;
      direction = -1;
    } else if (teamIndex < 0) {
      teamIndex = 0;
      direction = 1;
    }
  }

  return teams;
}

export function randomizeTeams(
  players: Player[],
  numTeams: number = 2
): Team[] {
  // Shuffle players first, then balance
  const shuffledPlayers = shuffleArray(players);
  return balanceTeams(shuffledPlayers, numTeams);
}

function createEmptyTeams(numTeams: number): Team[] {
  const teamColors = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#ec4899', // Pink
  ];

  const teamNames = [
    'Team Red',
    'Team Blue',
    'Team Green',
    'Team Yellow',
    'Team Purple',
    'Team Pink',
  ];

  return Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i}`,
    name: teamNames[i] || `Team ${i + 1}`,
    color: teamColors[i] || '#6b7280',
    players: [],
  }));
}

export function getTeamStatAverage(
  players: Player[],
  statKey: keyof PlayerStats
): number {
  if (players.length === 0) return 0;
  const total = players.reduce((sum, p) => sum + p.stats[statKey], 0);
  return Math.round((total / players.length) * 10) / 10;
}
