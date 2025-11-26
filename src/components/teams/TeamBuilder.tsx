'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Shuffle, RotateCcw, Users, Shirt, Trophy, Save, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Player, Team } from '@/lib/types';
import { balanceTeams, randomizeTeams, calculateTeamOverall } from '@/lib/team-balancer';
import { PitchView } from './PitchView';
import { DraggablePlayer } from './DraggablePlayer';

export function TeamBuilder() {
  const { players } = usePlayers();
  const { addMatch } = useMatches();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined);
  const [matchTime, setMatchTime] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize with balanced teams
  useEffect(() => {
    if (players.length > 0 && teams.length === 0) {
      handleBalanceTeams();
    } else if (players.length === 0) {
      setTeams([]);
      setUnassignedPlayers([]);
    }
  }, [players]);

  const handleBalanceTeams = useCallback(() => {
    const balanced = balanceTeams(players, 2);
    setTeams(balanced);
    setUnassignedPlayers([]);
  }, [players]);

  const handleRandomizeTeams = useCallback(() => {
    const randomized = randomizeTeams(players, 2);
    setTeams(randomized);
    setUnassignedPlayers([]);
  }, [players]);

  const handleResetTeams = useCallback(() => {
    setTeams([
      { id: 'team-0', name: 'Team Red', color: '#ef4444', players: [] },
      { id: 'team-1', name: 'Team Blue', color: '#3b82f6', players: [] },
    ]);
    setUnassignedPlayers([...players]);
  }, [players]);

  const findPlayerContainer = (playerId: string): string | null => {
    if (unassignedPlayers.find((p) => p.id === playerId)) {
      return 'unassigned';
    }
    for (const team of teams) {
      if (team.players.find((p) => p.id === playerId)) {
        return team.id;
      }
    }
    return null;
  };

  const findPlayer = (playerId: string): Player | null => {
    const unassigned = unassignedPlayers.find((p) => p.id === playerId);
    if (unassigned) return unassigned;

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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findPlayerContainer(activeId);
    let overContainer = findPlayerContainer(overId);

    // Check if dragging over a team container directly
    if (teams.find((t) => t.id === overId) || overId === 'unassigned') {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move player between containers
    const player = findPlayer(activeId);
    if (!player) return;

    // Remove from source
    if (activeContainer === 'unassigned') {
      setUnassignedPlayers((prev) => prev.filter((p) => p.id !== activeId));
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
      setUnassignedPlayers((prev) => [...prev, player]);
    } else {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === overContainer
            ? { ...team, players: [...team.players, player] }
            : team
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findPlayerContainer(activeId);
    const overContainer = findPlayerContainer(overId);

    if (!activeContainer || !overContainer) return;

    // Reorder within same container
    if (activeContainer === overContainer && activeId !== overId) {
      if (activeContainer === 'unassigned') {
        setUnassignedPlayers((prev) => {
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
        team.id === teamId
          ? { ...team, captainId: playerId }
          : team
      )
    );
  };

  const handleOpenMatchDialog = () => {
    if (teams.length < 2) return;
    // Set default date/time to now
    const now = new Date();
    setMatchDate(now);
    setMatchTime(now.toTimeString().slice(0, 5));
    setShowMatchDialog(true);
  };

  const handleCreateMatch = () => {
    if (teams.length < 2 || !matchDate || !matchTime) return;

    // Combine date and time
    const [hours, minutes] = matchTime.split(':').map(Number);
    const dateTime = new Date(matchDate);
    dateTime.setHours(hours, minutes, 0, 0);

    // Create a match with current teams
    addMatch(teams[0], teams[1], dateTime.toISOString());

    setShowMatchDialog(false);
    // Redirect to matches page
    router.push('/matches');
  };

  const teamDifference = teams.length === 2
    ? Math.abs(calculateTeamOverall(teams[0].players) - calculateTeamOverall(teams[1].players))
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
            <Button onClick={handleRandomizeTeams} className="gap-2 font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 h-10 px-4 rounded-xl transition-all hover:scale-105">
              <Shuffle className="h-4 w-4" />
              Auto Balance
            </Button>
            <Button onClick={handleResetTeams} variant="ghost" className="gap-2 h-10 px-4 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <div className="hidden sm:block w-px h-8 bg-white/10 mx-2" />
            <Button
              onClick={handleOpenMatchDialog}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-none shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] h-10 px-6 rounded-xl font-bold transition-all hover:scale-105"
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
                  : 'border-rose-500/50 text-rose-400 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}
            >
              DIFF: {teamDifference.toFixed(1)}
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
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Bench (Unassigned Players) */}
        {unassignedPlayers.length > 0 && (
          <Card className="glass p-6 border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Shirt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-sm">Reserves</h3>
                <p className="text-xs text-muted-foreground font-medium">Drag players to the pitch</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs font-bold bg-white/10 text-white border-white/5">
                {unassignedPlayers.length} Available
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {unassignedPlayers.map((player) => (
                <DraggablePlayer key={player.id} player={player} />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePlayer && (
          <div className="opacity-90 scale-105 cursor-grabbing">
            <DraggablePlayer player={activePlayer} />
          </div>
        )}
      </DragOverlay>

      {/* Match Creation Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Match
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="font-bold" style={{ color: teams[0]?.color }}>{teams[0]?.name}</span>
              <span className="text-muted-foreground font-bold">VS</span>
              <span className="font-bold" style={{ color: teams[1]?.color }}>{teams[1]?.name}</span>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {matchDate ? format(matchDate, 'EEEE, MMMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={matchDate}
                    onSelect={setMatchDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="match-time">Time</Label>
              <Input
                id="match-time"
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            {matchDate && matchTime && (
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-bold text-primary">
                  {format(matchDate, 'EEEE, MMMM d')} at {matchTime}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowMatchDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMatch}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={!matchDate || !matchTime}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Create Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}

