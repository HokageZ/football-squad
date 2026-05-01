'use client';

import { Shield } from 'lucide-react';
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
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 p-8 sm:p-12"
      >
        <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <Shield className="h-3 w-3 fill-current" />
            Tactical Center
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
            SQUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">BUILDER</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-lg">
            Drag and drop to create the ultimate lineup. Balance your teams or let our AI optimize the match.
          </p>
        </div>
      </div>

      {/* Team Builder Interface */}
      <TeamBuilder />
    </div>
  );
}
