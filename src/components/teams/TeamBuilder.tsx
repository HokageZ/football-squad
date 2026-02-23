'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Shuffle, RotateCcw, Users, Shirt, Trophy, CalendarIcon, Shield, Ban, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { usePlayers } from '@/context/PlayerContext';
import { useMatches } from '@/context/MatchContext';
import { Player, Team, POSITION_COLORS } from '@/lib/types';
import { balanceTeams, randomizeTeams, calculateTeamOverall, calculateOverall, calculateTeamTotalOverall } from '@/lib/team-balancer';
import { getStoredTeams, setStoredTeams, getStoredUnassigned, setStoredUnassigned, getStoredBench, setStoredBench } from '@/lib/storage';
import { PitchView } from './PitchView';
import { DraggablePlayer } from './DraggablePlayer';
import { toast } from 'sonner';

export function TeamBuilder() {
  const { players } = usePlayers();
  const { addMatch } = useMatches();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<Player[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined);
  const [matchTime, setMatchTime] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Initialize teams - restore from storage or balance
  useEffect(() => {
    if (players.length === 0) {
      setTeams([]);
      setUnassignedPlayers([]);
      setBenchPlayers([]);
      return;
    }

    const storedTeams = getStoredTeams();
    const storedUnassignedIds = getStoredUnassigned();
    const storedBenchIds = getStoredBench();
    
    if (storedTeams.length > 0) {
      const currentPlayerIds = new Set(players.map(p => p.id));
      
      const restoredTeams = storedTeams.map(team => ({
        ...team,
        players: team.players
          .filter(p => currentPlayerIds.has(p.id))
          .map(p => players.find(player => player.id === p.id)!)
      }));
      
      const assignedIds = new Set(restoredTeams.flatMap(t => t.players.map(p => p.id)));
      const benchIds = new Set(storedBenchIds);
      
      // Restore bench players
      const bench = players.filter(p => benchIds.has(p.id) && !assignedIds.has(p.id));
      const benchIdSet = new Set(bench.map(p => p.id));
      
      // Any player not on a team and not on bench goes to unassigned
      const unassigned = players.filter(p => 
        !assignedIds.has(p.id) && !benchIdSet.has(p.id)
      );
      
      setTeams(restoredTeams);
      setUnassignedPlayers(unassigned);
      setBenchPlayers(bench);
    } else {
      handleBalanceTeams();
    }
  }, [players.length]);

  // Persist teams whenever they change
  useEffect(() => {
    if (teams.length > 0) {
      setStoredTeams(teams);
    }
  }, [teams]);

  useEffect(() => {
    setStoredUnassigned(unassignedPlayers.map(p => p.id));
  }, [unassignedPlayers]);

  useEffect(() => {
    setStoredBench(benchPlayers.map(p => p.id));
  }, [benchPlayers]);

  const benchPlayerIds = benchPlayers.map(p => p.id);

  const handleBalanceTeams = useCallback(() => {
    const benchIds = benchPlayers.map(p => p.id);
    const balanced = balanceTeams(players, 2, true, benchIds);
    setTeams(balanced);
    setUnassignedPlayers([]);
    toast.success('Teams auto-balanced');
  }, [players, benchPlayers]);

  const handleRandomizeTeams = useCallback(() => {
    const benchIds = benchPlayers.map(p => p.id);
    const randomized = randomizeTeams(players, 2, benchIds);
    setTeams(randomized);
    setUnassignedPlayers([]);
    toast.success('Teams randomized');
  }, [players, benchPlayers]);

  const handleResetTeams = useCallback(() => {
    setTeams([
      { id: 'team-0', name: 'Team Red', color: '#ef4444', players: [] },
      { id: 'team-1', name: 'Team Blue', color: '#3b82f6', players: [] },
    ]);
    const nonBenched = players.filter(p => !benchPlayers.find(bp => bp.id === p.id));
    setUnassignedPlayers(nonBenched);
    toast('Teams reset');
  }, [players, benchPlayers]);

  const findPlayerContainer = (playerId: string): string | null => {
    if (unassignedPlayers.find((p) => p.id === playerId)) return 'unassigned';
    if (benchPlayers.find((p) => p.id === playerId)) return 'bench';
    for (const team of teams) {
      if (team.players.find((p) => p.id === playerId)) return team.id;
    }
    return null;
  };

  const findPlayer = (playerId: string): Player | null => {
    const unassigned = unassignedPlayers.find((p) => p.id === playerId);
    if (unassigned) return unassigned;
    const benched = benchPlayers.find((p) => p.id === playerId);
    if (benched) return benched;
    for (const team of teams) {
      const player = team.players.find((p) => p.id === playerId);
      if (player) return player;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const player = findPlayer(event.active.id as string);
    setActivePlayer(player);
  };

  const handleDragOver = () => {
    // Cross-container moves are handled in handleDragEnd to avoid
    // race conditions from rapid state updates during touch drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findPlayerContainer(activeId);
    let overContainer = findPlayerContainer(overId);

    // Check if dropping directly onto a container (team, unassigned, or bench)
    if (teams.find((t) => t.id === overId) || overId === 'unassigned' || overId === 'bench') {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

    const player = findPlayer(activeId);
    if (!player) return;

    // Cross-container move
    if (activeContainer !== overContainer) {
      // Remove from source
      if (activeContainer === 'unassigned') {
        setUnassignedPlayers((prev) => prev.filter((p) => p.id !== activeId));
      } else if (activeContainer === 'bench') {
        setBenchPlayers((prev) => prev.filter((p) => p.id !== activeId));
      } else {
        setTeams((prev) =>
          prev.map((team) =>
            team.id === activeContainer
              ? { ...team, players: team.players.filter((p) => p.id !== activeId) }
              : team
          )
        );
      }

      // Add to destination
      if (overContainer === 'unassigned') {
        setUnassignedPlayers((prev) => prev.some(p => p.id === player.id) ? prev : [...prev, player]);
      } else if (overContainer === 'bench') {
        setBenchPlayers((prev) => prev.some(p => p.id === player.id) ? prev : [...prev, player]);
      } else {
        setTeams((prev) =>
          prev.map((team) =>
            team.id === overContainer
              ? { ...team, players: team.players.some(p => p.id === player.id) ? team.players : [...team.players, player] }
              : team
          )
        );
      }
      return;
    }

    // Same-container reorder
    if (activeId !== overId) {
      if (activeContainer === 'unassigned') {
        setUnassignedPlayers((prev) => {
          const oldIndex = prev.findIndex((p) => p.id === activeId);
          const newIndex = prev.findIndex((p) => p.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      } else if (activeContainer === 'bench') {
        setBenchPlayers((prev) => {
          const oldIndex = prev.findIndex((p) => p.id === activeId);
          const newIndex = prev.findIndex((p) => p.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      } else {
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === activeContainer) {
              const oldIndex = team.players.findIndex((p) => p.id === activeId);
              const newIndex = team.players.findIndex((p) => p.id === overId);
              return {
                ...team,
                players: arrayMove(team.players, oldIndex, newIndex),
              };
            }
            return team;
          })
        );
      }
    }
  };

  const handleMakeCaptain = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, captainId: playerId } : team
      )
    );
  };

  const handleRenameTeam = (teamId: string, newName: string) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, name: newName } : team
      )
    );
  };

  const handleMoveToBench = (playerId: string) => {
    const player = findPlayer(playerId);
    if (!player) return;
    
    const container = findPlayerContainer(playerId);
    if (container === 'bench') return;
    if (!container) return; // Player not found in any container
    
    // Remove from current container
    if (container === 'unassigned') {
      setUnassignedPlayers(prev => prev.filter(p => p.id !== playerId));
    } else if (teams.find(t => t.id === container)) {
      // Only update teams if container is a valid team ID
      setTeams(prev => prev.map(team => ({
        ...team,
        players: team.players.filter(p => p.id !== playerId)
      })));
    } else {
      return; // Unknown container, don't proceed
    }
    
    // Add to bench (with dedup guard)
    setBenchPlayers(prev => prev.some(p => p.id === player.id) ? prev : [...prev, player]);
  };

  const handleMoveFromBench = (playerId: string) => {
    const player = benchPlayers.find(p => p.id === playerId);
    if (!player) return;
    
    setBenchPlayers(prev => prev.filter(p => p.id !== playerId));
    setUnassignedPlayers(prev => prev.some(p => p.id === player.id) ? prev : [...prev, player]);
  };

  const handleOpenMatchDialog = () => {
    if (teams.length < 2) return;
    const now = new Date();
    setMatchDate(now);
    setMatchTime(now.toTimeString().slice(0, 5));
    setShowMatchDialog(true);
  };

  const handleCreateMatch = () => {
    if (teams.length < 2 || !matchDate || !matchTime) return;

    const [hours, minutes] = matchTime.split(':').map(Number);
    const dateTime = new Date(matchDate);
    dateTime.setHours(hours, minutes, 0, 0);

    addMatch(teams[0], teams[1], dateTime.toISOString(), benchPlayers.length > 0 ? benchPlayers : undefined);

    setShowMatchDialog(false);
    toast.success('Match created');
    router.push('/matches');
  };

  const teamDifference = teams.length === 2
    ? Math.abs(calculateTeamOverall(teams[0].players) - calculateTeamOverall(teams[1].players))
    : 0;

  const totalDifference = teams.length === 2
    ? Math.abs(calculateTeamTotalOverall(teams[0].players) - calculateTeamTotalOverall(teams[1].players))
    : 0;

  if (players.length === 0) {
    return (
      <Card className="p-12 text-center glass">
        <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold mb-2">No Players Yet</h3>
        <p className="text-muted-foreground">
          Add some players first to start building teams
        </p>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Controls */}
        <div className="sticky top-20 z-30 glass p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button onClick={handleRandomizeTeams} className="gap-2 font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 h-10 px-4 rounded-xl transition-colors">
              <Shuffle className="h-4 w-4" />
              Auto Balance
            </Button>
            <Button onClick={handleResetTeams} variant="ghost" className="gap-2 h-10 px-4 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <div className="hidden sm:block w-px h-8 bg-white/10 mx-2" />
            <Button
              onClick={handleOpenMatchDialog}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-none shadow-lg hover:shadow-xl h-10 px-6 rounded-xl font-bold transition-[background,box-shadow]"
            >
              <Trophy className="h-4 w-4" />
              Create Match
            </Button>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-3 px-4 py-1 bg-black/20 rounded-xl border border-white/5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Balance
            </div>
            <Badge
              variant="outline"
              className={`text-sm font-black px-3 py-1 border ${teamDifference <= 1
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : teamDifference <= 3
                  ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                  : 'border-rose-500/50 text-rose-400 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}
            >
              AVG: {teamDifference.toFixed(1)} | TOT: {totalDifference}
            </Badge>
          </div>
        </div>

        {/* The Pitch */}
        <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-5 rounded-[2.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 min-h-[600px]">
            {teams.map((team, index) => (
              <div key={team.id} className="h-full">
                <PitchView
                  team={team}
                  side={index === 0 ? 'left' : 'right'}
                  onMakeCaptain={(playerId) => handleMakeCaptain(team.id, playerId)}
                  onBenchPlayer={handleMoveToBench}
                  onRenameTeam={(newName) => handleRenameTeam(team.id, newName)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bench (Players not playing) */}
        <BenchArea 
          players={benchPlayers} 
          onMoveFromBench={handleMoveFromBench}
        />

        {/* Reserves (Unassigned Players) */}
        {unassignedPlayers.length > 0 && (
          <UnassignedArea 
            players={unassignedPlayers}
            onMoveToBench={handleMoveToBench}
          />
        )}
      </div>

      {/* Drag Overlay — lightweight preview for smooth 60fps drag */}
      <DragOverlay dropAnimation={null}>
        {activePlayer && (
          <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-white/20 shadow-xl cursor-grabbing will-change-transform">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={activePlayer.image} alt={activePlayer.name} />
              <AvatarFallback className="bg-white/5 text-xs font-bold">
                {activePlayer.isUnknown ? '?' : activePlayer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sm truncate max-w-[120px]">{activePlayer.name}</span>
            <Badge variant="outline" className="font-mono font-bold text-xs ml-auto shrink-0">
              {activePlayer.isUnknown ? '?' : calculateOverall(activePlayer.stats)}
            </Badge>
          </div>
        )}
      </DragOverlay>

      {/* Enhanced Match Creation Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950/98 border-white/10 p-0 gap-0">
          {/* Match Poster Header */}
          <div className="relative overflow-hidden p-8 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-black/40 to-blue-900/20" />
            <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-5" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                <Trophy className="h-3 w-3" />
                Match Day
              </div>
              
              <div className="flex items-center justify-center gap-8 mb-4">
                {/* Team A */}
                <div className="flex-1 text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2" style={{ backgroundColor: `${teams[0]?.color}20` }}>
                    <Shield className="h-8 w-8" style={{ color: teams[0]?.color }} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: teams[0]?.color }}>
                    {teams[0]?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold">{teams[0]?.players.length} Players</p>
                </div>

                {/* VS */}
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-3xl font-black text-white/30">VS</span>
                </div>

                {/* Team B */}
                <div className="flex-1 text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2" style={{ backgroundColor: `${teams[1]?.color}20` }}>
                    <Shield className="h-8 w-8" style={{ color: teams[1]?.color }} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: teams[1]?.color }}>
                    {teams[1]?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold">{teams[1]?.players.length} Players</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Lineups */}
          <div className="grid grid-cols-2 gap-4 p-6 border-b border-white/10">
            {teams.slice(0, 2).map((team) => (
              <div key={team.id}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: team.color }}>
                  Lineup
                </h4>
                <div className="space-y-1.5">
                  {team.players.map((player, i) => (
                    <div key={player.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">{i + 1}</span>
                      <Avatar className="h-6 w-6 border border-white/10">
                        <AvatarImage src={player.image} />
                        <AvatarFallback className="text-[9px] font-bold bg-white/5">
                          {player.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold truncate flex-1">{player.name}</span>
                      {player.position && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ color: POSITION_COLORS[player.position], backgroundColor: `${POSITION_COLORS[player.position]}15` }}>
                          {player.position}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">{calculateOverall(player.stats)}</span>
                      {team.captainId === player.id && (
                        <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-1 rounded">C</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bench Players in dialog */}
          {benchPlayers.length > 0 && (
            <div className="px-6 py-3 border-b border-white/10 bg-amber-500/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                <Ban className="h-3 w-3" /> Bench ({benchPlayers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {benchPlayers.map(p => (
                  <span key={p.id} className="text-[11px] font-bold text-amber-300/70 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/10">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date/Time Picker */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-bold bg-white/5 border-white/10 hover:bg-white/10 h-12"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {matchDate ? format(matchDate, 'EEE, MMM d') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-white/10" align="start">
                    <Calendar mode="single" selected={matchDate} onSelect={setMatchDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kick-off</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="time"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 pl-10 font-bold"
                  />
                </div>
              </div>
            </div>

            {matchDate && matchTime && (
              <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Kick-off</p>
                <span className="text-lg font-black text-primary">
                  {format(matchDate, 'EEEE, MMMM d')} at {matchTime}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-0 gap-2">
            <Button variant="ghost" onClick={() => setShowMatchDialog(false)} className="font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleCreateMatch}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-8 shadow-lg"
              disabled={!matchDate || !matchTime}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Confirm & Create Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}

// Unassigned Area component
interface UnassignedAreaProps {
  players: Player[];
  onMoveToBench: (playerId: string) => void;
}

function UnassignedArea({ players, onMoveToBench }: UnassignedAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned' });
  
  return (
    <Card className="glass p-6 border-white/10 bg-zinc-900/90">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Shirt className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-black uppercase tracking-widest text-sm">Reserves</h3>
          <p className="text-xs text-muted-foreground font-medium">Drag to pitch or bench</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs font-bold bg-white/10 text-white border-white/5">
          {players.length} Available
        </Badge>
      </div>
      
      <div
        ref={setNodeRef}
        className={`transition-colors ${isOver ? 'bg-white/5 rounded-2xl p-2' : ''}`}
      >
        <SortableContext
          items={players.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {players.map((player) => (
              <div key={player.id} className="relative group">
                <DraggablePlayer player={player} />
                <button
                  onClick={() => onMoveToBench(player.id)}
                  className="absolute -top-1 -right-1 z-10 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity hover:bg-amber-400"
                  title="Move to bench"
                >
                  <Ban className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </SortableContext>
      </div>
    </Card>
  );
}

// Bench Area component
interface BenchAreaProps {
  players: Player[];
  onMoveFromBench: (playerId: string) => void;
}

function BenchArea({ players, onMoveFromBench }: BenchAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench' });
  
  return (
    <Card className="glass p-6 border-white/10 bg-zinc-900/90 border-l-4 border-l-amber-500/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Ban className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-black uppercase tracking-widest text-sm text-amber-400">Bench</h3>
          <p className="text-xs text-muted-foreground font-medium">Players not playing — excluded from auto-balance</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs font-bold bg-amber-500/10 text-amber-400 border-amber-500/20">
          {players.length} Benched
        </Badge>
      </div>
      
      <div
        ref={setNodeRef}
        className={`transition-colors ${isOver ? 'bg-amber-500/5 rounded-2xl p-2' : ''}`}
      >
        <SortableContext
          items={players.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {players.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground/40 border-2 border-dashed rounded-2xl">
              <Ban className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">Drag players here to bench them</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {players.map((player) => (
                <div key={player.id} className="relative group">
                  <DraggablePlayer player={player} />
                  <button
                    onClick={() => onMoveFromBench(player.id)}
                    className="absolute -top-1 -right-1 z-10 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity hover:bg-emerald-400"
                    title="Move to reserves"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </Card>
  );
}

