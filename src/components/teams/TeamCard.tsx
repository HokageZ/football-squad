'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Team, STAT_KEYS, STAT_LABELS, STAT_COLORS } from '@/lib/types';
import { calculateTeamOverall, getTeamStatAverage } from '@/lib/team-balancer';
import { DraggablePlayer } from './DraggablePlayer';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  });

  const teamOverall = calculateTeamOverall(team.players);

  return (
    <Card
      ref={setNodeRef}
      className={`
        h-full flex flex-col transition-all duration-200
        ${isOver ? 'ring-2 ring-primary shadow-lg' : ''}
      `}
      style={{
        borderTopColor: team.color,
        borderTopWidth: '4px',
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            {team.name}
          </CardTitle>
          <Badge variant="secondary" className="text-lg font-bold">
            {teamOverall}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{team.players.length} players</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {/* Team Stats Overview */}
        {team.players.length > 0 && (
          <div className="grid grid-cols-6 gap-1 mb-4 p-2 bg-accent/30 rounded-lg">
            {STAT_KEYS.map((key) => (
              <div key={key} className="text-center">
                <p
                  className="text-[10px] font-medium uppercase"
                  style={{ color: STAT_COLORS[key] }}
                >
                  {STAT_LABELS[key]}
                </p>
                <p className="text-sm font-bold">
                  {getTeamStatAverage(team.players, key)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Players List */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <SortableContext
            items={team.players.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 min-h-[200px]">
              {team.players.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Drag players here
                  </p>
                </div>
              ) : (
                team.players.map((player) => (
                  <DraggablePlayer
                    key={player.id}
                    player={player}
                    teamColor={team.color}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
