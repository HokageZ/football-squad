'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePlayers } from '@/context/PlayerContext';
import { Player, PlayerStats, PlayerPosition } from '@/lib/types';
import { PlayerCard } from '@/components/players/PlayerCard';
import { PlayerForm } from '@/components/players/PlayerForm';

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
    if (confirm('Are you sure you want to delete this player?')) {
      deletePlayer(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">
            Manage your squad of {players.length} players
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Player
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Players Grid/List */}
      {filteredPlayers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No Players Found' : 'No Players Yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your first player to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          )}
        </Card>
      ) : (
        <motion.div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-3'
          }
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                compact={viewMode === 'list'}
                onEdit={() => setEditingPlayer(player)}
                onDelete={() => handleDeletePlayer(player.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <PlayerForm
            onSubmit={handleAddPlayer}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Player Sheet */}
      <Sheet open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md w-full bg-black/95 border-l border-white/10 backdrop-blur-xl p-0">
          <SheetHeader className="p-6 pb-2 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md">
            <SheetTitle className="text-xl font-black tracking-tight">EDIT PLAYER</SheetTitle>
          </SheetHeader>
          <div className="p-6">
            {editingPlayer && (
              <PlayerForm
                player={editingPlayer}
                onSubmit={handleEditPlayer}
                onCancel={() => setEditingPlayer(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
