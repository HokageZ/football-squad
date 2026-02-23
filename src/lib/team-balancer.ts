import { Player, PlayerStats, PlayerPosition, STAT_KEYS, Team, POSITION_STAT_WEIGHTS, OUTFIELD_STAT_KEYS } from './types';

export function calculateOverall(stats: PlayerStats): number {
  const total = OUTFIELD_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
  return Math.round(total / OUTFIELD_STAT_KEYS.length);
}

/**
 * Calculate position-weighted overall rating.
 * A GK with high DEF gets a better rating than a GK with high SHO.
 */
export function calculatePositionOverall(stats: PlayerStats, position?: PlayerPosition): number {
  if (!position) return calculateOverall(stats);
  
  const weights = POSITION_STAT_WEIGHTS[position];
  const weighted = STAT_KEYS.reduce((sum, key) => sum + stats[key] * weights[key], 0);
  return Math.round(weighted);
}

/**
 * Get the effective overall rating for a player.
 * Uses position-weighted calculation when position is set, otherwise base overall.
 */
export function getPlayerOverall(player: Player): number {
  return player.position
    ? calculatePositionOverall(player.stats, player.position)
    : calculateOverall(player.stats);
}

export function calculateTeamOverall(players: Player[]): number {
  // Filter out unknown players from team rating
  const knownPlayers = players.filter(p => !p.isUnknown);
  
  if (knownPlayers.length === 0) return 0;
  
  const total = knownPlayers.reduce((sum, p) => sum + getPlayerOverall(p), 0);
  return Math.round(total / knownPlayers.length);
}

export function calculateTeamTotalOverall(players: Player[]): number {
  return players
    .filter(p => !p.isUnknown)
    .reduce((sum, p) => sum + getPlayerOverall(p), 0);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Improved team balancing algorithm:
 * 1. Uses total strength (sum) instead of just average to penalize teams with fewer players
 * 2. Snake draft by position groups for position-balanced teams
 * 3. Iterative swap optimization to minimize rating difference
 * 4. Handles odd player counts - weaker team gets extra player
 * 5. Supports excluding benched players
 */
export function balanceTeams(
  players: Player[],
  numTeams: number = 2,
  balanceByPosition: boolean = true,
  excludePlayerIds: string[] = []
): Team[] {
  // Filter out excluded (benched) players
  const activePlayers = players.filter(p => !excludePlayerIds.includes(p.id));
  
  if (activePlayers.length === 0) {
    return createEmptyTeams(numTeams);
  }

  // Initialize teams
  let teams: Team[] = createEmptyTeams(numTeams);

  if (balanceByPosition) {
    // Group players by position
    const playersByPosition: Record<string, Player[]> = {
      GK: [],
      DEF: [],
      MID: [],
      ATT: [],
      NONE: [],
    };

    activePlayers.forEach(p => {
      const pos = p.position || 'NONE';
      playersByPosition[pos].push(p);
    });

    // Sort each position group by rating (desc), unknowns at end
    Object.keys(playersByPosition).forEach(pos => {
      playersByPosition[pos].sort((a, b) => {
        if (a.isUnknown && b.isUnknown) return 0;
        if (a.isUnknown) return 1;
        if (b.isUnknown) return -1;
        return getPlayerOverall(b) - getPlayerOverall(a);
      });
    });

    // Distribute each position group using snake draft
    // Start with GK to ensure each team gets one if possible
    const positionOrder = ['GK', 'DEF', 'MID', 'ATT', 'NONE'];
    
    for (const pos of positionOrder) {
      const posPlayers = playersByPosition[pos];
      if (posPlayers.length === 0) continue;

      // Determine starting team: the one with lower total strength goes first
      let teamIndex = getWeakestTeamIndex(teams);
      let direction = 1;

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
    // Sort all players by rating
    const sortedPlayers = [...activePlayers].sort((a, b) => {
      if (a.isUnknown && b.isUnknown) return 0;
      if (a.isUnknown) return 1;
      if (b.isUnknown) return -1;
      return getPlayerOverall(b) - getPlayerOverall(a);
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

  // Phase 2: Iterative swap optimization
  teams = optimizeTeamBalance(teams, numTeams);

  return teams;
}

/**
 * Find the team with the lowest total strength
 */
function getWeakestTeamIndex(teams: Team[]): number {
  let minTotal = Infinity;
  let minIndex = 0;
  
  teams.forEach((team, index) => {
    const total = calculateTeamTotalOverall(team.players);
    if (total < minTotal) {
      minTotal = total;
      minIndex = index;
    }
  });
  
  return minIndex;
}

/**
 * Iterative swap optimization:
 * Try all possible player swaps between teams and keep swaps that reduce the difference.
 * Also try moving a player from the stronger to the weaker team (for uneven counts).
 */
function optimizeTeamBalance(teams: Team[], numTeams: number): Team[] {
  const MAX_ITERATIONS = 100;
  let bestTeams = teams.map(t => ({ ...t, players: [...t.players] }));
  let bestDiff = getMaxTotalDifference(bestTeams);
  
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let improved = false;
    
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        const teamA = bestTeams[i];
        const teamB = bestTeams[j];
        
        // Try all player swaps between team i and team j
        for (let a = 0; a < teamA.players.length; a++) {
          for (let b = 0; b < teamB.players.length; b++) {
            const playerA = teamA.players[a];
            const playerB = teamB.players[b];
            
            if (playerA.isUnknown && playerB.isUnknown) continue;
            
            // Only swap players of same position group to maintain position balance
            const posA = playerA.position || 'NONE';
            const posB = playerB.position || 'NONE';
            if (posA !== posB && posA !== 'NONE' && posB !== 'NONE') continue;
            
            // Temporarily swap
            teamA.players[a] = playerB;
            teamB.players[b] = playerA;
            
            const newDiff = getMaxTotalDifference(bestTeams);
            
            if (newDiff < bestDiff) {
              bestDiff = newDiff;
              improved = true;
            } else {
              // Swap back
              teamA.players[a] = playerA;
              teamB.players[b] = playerB;
            }
          }
        }
        
        // Try moving a player from the stronger team to weaker team (for uneven counts)
        const totalA = calculateTeamTotalOverall(teamA.players);
        const totalB = calculateTeamTotalOverall(teamB.players);
        
        if (Math.abs(teamA.players.length - teamB.players.length) <= 1) {
          const strongerTeam = totalA > totalB ? teamA : teamB;
          const weakerTeam = totalA > totalB ? teamB : teamA;
          
          if (strongerTeam.players.length > weakerTeam.players.length) {
            for (let p = 0; p < strongerTeam.players.length; p++) {
              const player = strongerTeam.players[p];
              
              strongerTeam.players.splice(p, 1);
              weakerTeam.players.push(player);
              
              const newDiff = getMaxTotalDifference(bestTeams);
              
              if (newDiff < bestDiff) {
                bestDiff = newDiff;
                improved = true;
                break;
              } else {
                weakerTeam.players.pop();
                strongerTeam.players.splice(p, 0, player);
              }
            }
          }
        }
      }
    }
    
    if (!improved) break;
  }
  
  return bestTeams;
}

/**
 * Get the maximum total strength difference between any two teams
 */
function getMaxTotalDifference(teams: Team[]): number {
  const totals = teams.map(t => calculateTeamTotalOverall(t.players));
  const max = Math.max(...totals);
  const min = Math.min(...totals);
  return max - min;
}

export function randomizeTeams(
  players: Player[],
  numTeams: number = 2,
  excludePlayerIds: string[] = []
): Team[] {
  const activePlayers = players.filter(p => !excludePlayerIds.includes(p.id));
  const shuffledPlayers = shuffleArray(activePlayers);
  return balanceTeams(shuffledPlayers, numTeams, true, []);
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

/**
 * Detect the best-fit position based on stat distribution.
 */
export function detectBestPosition(stats: PlayerStats): PlayerPosition {
  let bestPos: PlayerPosition = 'MID';
  let bestScore = -1;
  
  (Object.entries(POSITION_STAT_WEIGHTS) as [PlayerPosition, Record<string, number>][]).forEach(([pos, weights]) => {
    const score = STAT_KEYS.reduce((sum, key) => sum + stats[key] * weights[key], 0);
    if (score > bestScore) {
      bestScore = score;
      bestPos = pos;
    }
  });
  
  // Additional heuristic checks
  if (stats.defending >= 75 && stats.physical >= 70 && stats.shooting <= 55) {
    return 'DEF';
  }
  if (stats.shooting >= 80 && stats.pace >= 75 && stats.defending <= 50) {
    return 'ATT';
  }
  if (stats.goalkeeping >= 70) {
    return 'GK';
  }
  if (stats.defending >= 85 && stats.pace <= 55) {
    return 'GK';
  }
  
  return bestPos;
}

/**
 * Validate stats and return warnings
 */
export function validateStats(stats: PlayerStats, position?: PlayerPosition): string[] {
  const warnings: string[] = [];
  
  const allMax = OUTFIELD_STAT_KEYS.every(key => stats[key] >= 95);
  if (allMax) {
    warnings.push('All stats maxed out — is this player really elite in everything?');
  }
  
  if (position === 'GK') {
    if (stats.goalkeeping <= 40) {
      warnings.push('A goalkeeper should typically have a higher goalkeeping stat.');
    }
    if (stats.shooting >= 85 && stats.goalkeeping <= 50) {
      warnings.push('A goalkeeper with high shooting but low goalkeeping is unusual.');
    }
  }
  
  if (position === 'DEF') {
    if (stats.defending <= 40) {
      warnings.push('A defender should typically have higher defending stats.');
    }
  }
  
  if (position === 'ATT') {
    if (stats.shooting <= 40 && stats.pace <= 40) {
      warnings.push('An attacker without pace or shooting may struggle up front.');
    }
  }
  
  return warnings;
}
