'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, MoreVertical, Trash2, Edit2, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMatches } from '@/context/MatchContext';
import { Match } from '@/lib/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export default function MatchesPage() {
  const { matches, updateMatch, deleteMatch } = useMatches();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { a: string; b: string } }>({});

  const handleScoreChange = (matchId: string, team: 'a' | 'b', value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: value },
    }));
  };

  const handleSaveScore = (match: Match) => {
    const matchScores = scores[match.id];
    if (matchScores && matchScores.a !== '' && matchScores.b !== '') {
      updateMatch(match.id, {
        scoreA: parseInt(matchScores.a),
        scoreB: parseInt(matchScores.b),
        status: 'completed',
      });
      setEditingMatchId(null);
    }
  };

  const getWinner = (match: Match) => {
    if (match.status !== 'completed' || match.scoreA === undefined || match.scoreB === undefined) return null;
    if (match.scoreA > match.scoreB) return 'a';
    if (match.scoreB > match.scoreA) return 'b';
    return 'draw';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-white/10 p-8 sm:p-12"
      >
        <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <Medal className="h-3 w-3 fill-current" />
            Match Center
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
            MATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">HISTORY</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-lg">
            Review past performances, analyze results, and track your squad's journey to glory.
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div>
          <Card className="p-16 text-center glass border-dashed border-white/10 bg-white/5">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">No Matches Recorded</h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Head over to the Team Builder to organize your first match.
            </p>
          </Card>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
              <div key={match.id}>
                <Card className="glass overflow-hidden group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Date & Status Panel */}
                      <div className="p-4 md:w-48 bg-black/20 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center items-center text-center gap-2">
                        <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'} className="mb-1">
                          {match.status === 'completed' ? 'FULL TIME' : 'UPCOMING'}
                        </Badge>
                        <div className="text-sm font-bold text-white">
                          {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Scoreboard */}
                      <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        {/* Background Gradients */}
                        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `linear-gradient(to right, ${match.teamA.color}10, transparent)` }} />
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `linear-gradient(to left, ${match.teamB.color}10, transparent)` }} />

                        {/* Team A */}
                        <div className="flex-1 text-center sm:text-right relative z-10">
                          <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight truncate" style={{ color: match.teamA.color }}>
                            {match.teamA.name}
                          </h3>
                          <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">HOME</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{match.teamA.players.length} Players</span>
                          </div>
                        </div>

                        {/* Score Display */}
                        <div className="flex items-center gap-4 min-w-[140px] justify-center relative z-10">
                          {editingMatchId === match.id ? (
                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                              <Input
                                type="number"
                                className="w-12 text-center font-bold bg-white/5 border-white/10 h-9"
                                value={scores[match.id]?.a || ''}
                                onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                              />
                              <span className="font-black text-muted-foreground">-</span>
                              <Input
                                type="number"
                                className="w-12 text-center font-bold bg-white/5 border-white/10 h-9"
                                value={scores[match.id]?.b || ''}
                                onChange={(e) => handleScoreChange(match.id, 'b', e.target.value)}
                              />
                              <Button size="icon" className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSaveScore(match)}>
                                <Trophy className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              {match.status === 'completed' ? (
                                <div className="px-6 py-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                                  <div className="text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4">
                                    <span className={getWinner(match) === 'a' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-white'}>
                                      {match.scoreA}
                                    </span>
                                    <span className="text-white/10 text-2xl sm:text-3xl">:</span>
                                    <span className={getWinner(match) === 'b' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-white'}>
                                      {match.scoreB}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-primary/50 text-primary hover:bg-primary/10 font-bold"
                                  onClick={() => setEditingMatchId(match.id)}
                                >
                                  Enter Score
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex-1 text-center sm:text-left relative z-10">
                          <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight truncate" style={{ color: match.teamB.color }}>
                            {match.teamB.name}
                          </h3>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">AWAY</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{match.teamB.players.length} Players</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2 flex items-center border-l border-white/10 bg-white/[0.02]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
                            <DropdownMenuItem onClick={() => setEditingMatchId(match.id)} className="focus:bg-white/10">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Result
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => deleteMatch(match.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Match
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
        </motion.div>
      )}
    </div>
  );
}
