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
import { Shuffle, RotateCcw, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { usePlayers } from '@/context/PlayerContext';
import { Player, Team } from '@/lib/types';
import { balanceTeams, randomizeTeams, calculateTeamOverall } from '@/lib/team-balancer';
import { TeamCard } from './TeamCard';
import { DraggablePlayer } from './DraggablePlayer';

export function TeamBuilder() {
  const { players } = usePlayers();
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

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
    if (teams.find((t) => t.id === overId)) {
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

  const teamDifference = teams.length === 2
    ? Math.abs(calculateTeamOverall(teams[0].players) - calculateTeamOverall(teams[1].players))
    : 0;

  if (players.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
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
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRandomizeTeams} className="gap-2">
              <Shuffle className="h-4 w-4" />
              Randomize Teams
            </Button>
            <Button onClick={handleBalanceTeams} variant="secondary" className="gap-2">
              Balance Teams
            </Button>
            <Button onClick={handleResetTeams} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <Badge
            variant={teamDifference <= 1 ? 'default' : 'secondary'}
            className="text-sm"
          >
            Team Difference: {teamDifference.toFixed(1)}
          </Badge>
        </div>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Unassigned Players */}
        {unassignedPlayers.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unassigned Players ({unassignedPlayers.length})
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
          <div className="opacity-80">
            <DraggablePlayer player={activePlayer} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
