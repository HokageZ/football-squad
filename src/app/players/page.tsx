'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Grid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePlayers } from '@/context/PlayerContext';
import { Player, PlayerStats, PlayerPosition } from '@/lib/types';
import { PlayerCard } from '@/components/players/PlayerCard';
import { PlayerForm } from '@/components/players/PlayerForm';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

export default function PlayersPage() {
  const { players, isLoading, addPlayer, updatePlayer, deletePlayer } =
    usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPlayer = (data: {
    name: string;
    stats: PlayerStats;
    image?: string;
    isUnknown?: boolean;
    position?: PlayerPosition;
  }) => {
    addPlayer(data.name, data.stats, data.image, data.isUnknown, data.position);
    setIsAddDialogOpen(false);
  };

  const handleEditPlayer = (data: {
    name: string;
    stats: PlayerStats;
    image?: string;
    isUnknown?: boolean;
    position?: PlayerPosition;
  }) => {
    if (editingPlayer) {
      updatePlayer(editingPlayer.id, data);
      setEditingPlayer(null);
    }
  };

  const handleDeletePlayer = (id: string) => {
    // Remove blocking confirm() - it kills INP scores
    // Delete immediately for snappy UX
    deletePlayer(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            SQUAD <span className="text-primary">ROSTER</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Manage your elite athletes, track their development, and scout for new talent.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="mr-2 h-5 w-5" />
            Recruit Player
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="sticky top-20 z-30 p-2 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-xl flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-transparent focus:bg-white/10 focus:border-primary/50 rounded-xl font-medium transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`h-10 px-4 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/10'}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`h-10 px-4 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/10'}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Players Grid/List */}
      {filteredPlayers.length === 0 ? (
        <div>
          <Card className="p-16 text-center glass border-dashed border-white/10 bg-white/5">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">
              {searchQuery ? 'No Matches Found' : 'Empty Roster'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              {searchQuery
                ? `We couldn't find any players matching "${searchQuery}"`
                : 'Start building your legacy by adding your first player.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                <Plus className="h-4 w-4" />
                Add First Player
              </Button>
            )}
          </Card>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-3'
          }
        >
          {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                compact={viewMode === 'list'}
                onEdit={() => setEditingPlayer(player)}
                onDelete={() => handleDeletePlayer(player.id)}
              />
            ))}
        </motion.div>
      )}

      {/* Player Form Dialog (unified for Add/Edit) */}
      <Dialog open={isAddDialogOpen || !!editingPlayer} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingPlayer(null);
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-black/95 border-white/10 p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-zinc-950 sticky top-0 z-50">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              {editingPlayer ? (
                <>
                  <Users className="h-6 w-6 text-primary" />
                  EDIT PLAYER
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 text-primary" />
                  NEW SIGNING
                </>
              )}
            </DialogTitle>
            {editingPlayer && (
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Updating {editingPlayer.name}
              </p>
            )}
          </DialogHeader>
          <div className="p-6">
            <PlayerForm
              player={editingPlayer || undefined}
              onSubmit={editingPlayer ? handleEditPlayer : handleAddPlayer}
              onCancel={() => {
                setIsAddDialogOpen(false);
                setEditingPlayer(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
