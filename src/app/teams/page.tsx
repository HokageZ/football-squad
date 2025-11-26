'use client';

import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { TeamBuilder } from '@/components/teams/TeamBuilder';
import { usePlayers } from '@/context/PlayerContext';

export default function TeamsPage() {
  const { isLoading } = usePlayers();

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Team Builder</h1>
        </div>
        <p className="text-muted-foreground">
          Create balanced teams using drag and drop or auto-balance
        </p>
      </motion.div>

      {/* Team Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TeamBuilder />
      </motion.div>
    </div>
  );
}
