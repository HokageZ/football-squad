import { Player, PlayerStats, PlayerPosition, STAT_KEYS, Team, POSITIONS } from './types';

export function calculateOverall(stats: PlayerStats): number {
  const total = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
  return Math.round(total / STAT_KEYS.length);
}

export function calculateTeamOverall(players: Player[]): number {
  // Filter out unknown players from team rating
  const knownPlayers = players.filter(p => !p.isUnknown);
  
  if (knownPlayers.length === 0) return 0;
  
  const total = knownPlayers.reduce((sum, p) => sum + calculateOverall(p.stats), 0);
  return Math.round(total / knownPlayers.length);
}

export function calculateTeamTotalOverall(players: Player[]): number {
  return players
    .filter(p => !p.isUnknown)
    .reduce((sum, p) => sum + calculateOverall(p.stats), 0);
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
  numTeams: number = 2,
  balanceByPosition: boolean = true
): Team[] {
  if (players.length === 0) {
    return createEmptyTeams(numTeams);
  }

  // Initialize teams
  const teams: Team[] = createEmptyTeams(numTeams);

  if (balanceByPosition) {
    // Group players by position
    const playersByPosition: Record<string, Player[]> = {
      GK: [],
      DEF: [],
      MID: [],
      ATT: [],
      NONE: [], // Players without position
    };

    players.forEach(p => {
      const pos = p.position || 'NONE';
      playersByPosition[pos].push(p);
    });

    // Sort each position group by rating (desc), unknowns at end
    Object.keys(playersByPosition).forEach(pos => {
      playersByPosition[pos].sort((a, b) => {
        if (a.isUnknown && b.isUnknown) return 0;
        if (a.isUnknown) return 1;
        if (b.isUnknown) return -1;
        return calculateOverall(b.stats) - calculateOverall(a.stats);
      });
    });

    // Distribute each position group using snake draft
    const positionOrder = ['GK', 'DEF', 'MID', 'ATT', 'NONE'];
    
    for (const pos of positionOrder) {
      const posPlayers = playersByPosition[pos];
      let teamIndex = 0;
      let direction = 1;

      // Alternate starting team for each position to improve balance
      const teamOveralls = teams.map(t => calculateTeamTotalOverall(t.players));
      if (teamOveralls[1] < teamOveralls[0]) {
        teamIndex = 1;
      }

      for (const player of posPlayers) {
        teams[teamIndex].players.push(player);
        
        teamIndex += direction;
        
        if (teamIndex >= numTeams) {
          teamIndex = numTeams - 1;
          direction = -1;
        } else if (teamIndex < 0) {
          teamIndex = 0;
          direction = 1;
        }
      }
    }
  } else {
    // Original behavior: Sort all players by rating
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.isUnknown && b.isUnknown) return 0;
      if (a.isUnknown) return 1;
      if (b.isUnknown) return -1;
      return calculateOverall(b.stats) - calculateOverall(a.stats);
    });

    let teamIndex = 0;
    let direction = 1;

    for (const player of sortedPlayers) {
      teams[teamIndex].players.push(player);
      
      teamIndex += direction;
      
      if (teamIndex >= numTeams) {
        teamIndex = numTeams - 1;
        direction = -1;
      } else if (teamIndex < 0) {
        teamIndex = 0;
        direction = 1;
      }
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
    '#10b981', // Green
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
  const knownPlayers = players.filter(p => !p.isUnknown);
  if (knownPlayers.length === 0) return 0;
  
  const total = knownPlayers.reduce((sum, p) => sum + p.stats[statKey], 0);
  return Math.round(total / knownPlayers.length);
}

export function getTeamPositionBreakdown(players: Player[]): Record<PlayerPosition | 'NONE', number> {
  const breakdown: Record<PlayerPosition | 'NONE', number> = {
    GK: 0,
    DEF: 0,
    MID: 0,
    ATT: 0,
    NONE: 0,
  };

  players.forEach(p => {
    const pos = p.position || 'NONE';
    breakdown[pos]++;
  });

  return breakdown;
}
