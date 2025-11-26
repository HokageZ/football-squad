'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Trophy, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">MATCH HISTORY</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your squad's performance and results</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="glass p-8 sm:p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Matches Played Yet</h3>
          <p className="text-muted-foreground">
            Create teams and start a match from the Team Builder page
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
              <motion.div
                key={match.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="glass overflow-hidden group hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Date & Status */}
                      <div className="p-3 sm:p-4 md:w-40 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center items-center text-center gap-1.5 sm:gap-2">
                        <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'}>
                          {match.status === 'completed' ? 'Finished' : 'Scheduled'}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline-block mr-1 mb-0.5" />
                          {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(match.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline-block mr-1 mb-0.5" />
                          {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Teams & Score */}
                      <div className="flex-1 p-3 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-8">
                        {/* Team A */}
                        <div className="flex-1 text-center sm:text-right">
                          <h3 className="font-black text-base sm:text-xl uppercase truncate" style={{ color: match.teamA.color }}>
                            {match.teamA.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">
                            {match.teamA.players.length} Players
                          </p>
                        </div>

                        {/* Score Display */}
                        <div className="flex items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[120px] justify-center">
                          {editingMatchId === match.id ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Input
                                type="number"
                                className="w-10 sm:w-12 text-center text-sm"
                                value={scores[match.id]?.a || ''}
                                onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                              />
                              <span className="font-bold text-muted-foreground text-sm">-</span>
                              <Input
                                type="number"
                                className="w-10 sm:w-12 text-center text-sm"
                                value={scores[match.id]?.b || ''}
                                onChange={(e) => handleScoreChange(match.id, 'b', e.target.value)}
                              />
                              <Button size="sm" className="text-xs px-2 sm:px-3" onClick={() => handleSaveScore(match)}>Save</Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              {match.status === 'completed' ? (
                                <div className="text-2xl sm:text-4xl font-black tracking-tighter flex items-center gap-2 sm:gap-3">
                                  <span className={getWinner(match) === 'a' ? 'text-primary' : ''}>{match.scoreA}</span>
                                  <span className="text-muted-foreground/30 text-xl sm:text-2xl">-</span>
                                  <span className={getWinner(match) === 'b' ? 'text-primary' : ''}>{match.scoreB}</span>
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setEditingMatchId(match.id)}>
                                  Enter Score
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-black text-base sm:text-xl uppercase truncate" style={{ color: match.teamB.color }}>
                            {match.teamB.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">
                            {match.teamB.players.length} Players
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2 flex items-center border-l border-white/10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMatchId(match.id)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Result
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
