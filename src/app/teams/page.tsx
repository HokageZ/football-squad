'use client';

import { Shield } from 'lucide-react';
import { TeamBuilder } from '@/components/teams/TeamBuilder';
import { usePlayers } from '@/context/PlayerContext';

export default function TeamsPage() {
  const { isLoading } = usePlayers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hero \u2014 Doppelrand */}
      <div className="relative p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-white/5 bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div
            className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-[0.04]"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 0%, rgba(16,185,129,0.18), transparent 60%)',
            }}
          />

          <div className="relative p-6 sm:p-10 md:p-14 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold tracking-[0.25em] uppercase mb-5">
              <Shield className="h-3 w-3" />
              Tactical Center
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4">
              SQUAD
              <br />
              <span className="text-primary">BUILDER.</span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium max-w-md leading-relaxed">
              Drag players onto the sheet. Auto-balance with one tap, or tweak the lineup by hand.
            </p>
          </div>
        </div>
      </div>

      {/* Team Builder Interface */}
      <TeamBuilder />
    </div>
  );
}
