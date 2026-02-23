'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, MoreVertical, Trash2, Edit2, Medal, ChevronDown, ChevronUp, Users, Shield, Ban, Bell, BellOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMatches } from '@/context/MatchContext';
import { Match, POSITION_COLORS } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Starting now!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className="text-primary font-bold text-xs">{timeLeft}</span>
  );
}

export default function MatchesPage() {
  const { matches, updateMatch, deleteMatch, notificationPermission, requestNotifications } = useMatches();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
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

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId(prev => prev === matchId ? null : matchId);
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

      {/* Notification Banner */}
      {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && matches.some(m => m.status === 'scheduled') && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Get notified before matches</p>
            <p className="text-xs text-muted-foreground">Receive a push notification 1 hour before kick-off</p>
          </div>
          <Button
            size="sm"
            onClick={requestNotifications}
            className="shrink-0 font-bold"
          >
            <Bell className="h-3 w-3 mr-1.5" />
            Enable
          </Button>
        </div>
      )}

      {notificationPermission === 'granted' && matches.some(m => m.status === 'scheduled') && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Bell className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">Notifications enabled — you'll be notified 1h before each match</span>
        </div>
      )}

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
          {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => {
            const winner = getWinner(match);
            const isExpanded = expandedMatchId === match.id;

            return (
              <div key={match.id}>
                <Card className={`glass overflow-hidden group transition-colors duration-300 ${
                  winner === 'a' || winner === 'b' ? 'hover:border-primary/30' : 'hover:border-white/20'
                } ${isExpanded ? 'border-primary/20' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {/* Main Match Row */}
                      <div className="flex flex-col md:flex-row items-stretch">
                        {/* Date & Status Panel */}
                        <div className="p-4 md:w-48 bg-black/20 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center items-center text-center gap-2">
                          <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'} className={`mb-1 ${match.status === 'completed' ? '' : 'border-primary/50 text-primary'}`}>
                            {match.status === 'completed' ? 'FULL TIME' : 'UPCOMING'}
                          </Badge>
                          <div className="text-sm font-bold text-white">
                            {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" />
                            {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {match.status === 'scheduled' && (
                            <div className="mt-1 px-2 py-1 bg-primary/10 rounded-full border border-primary/20">
                              <CountdownTimer targetDate={match.date} />
                            </div>
                          )}
                        </div>

                        {/* Scoreboard */}
                        <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                          {/* Team A */}
                          <div className="flex-1 text-center sm:text-right relative z-10">
                            <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                              <Shield className="h-4 w-4" style={{ color: match.teamA.color }} />
                              <h3 className={`font-black text-xl sm:text-2xl uppercase tracking-tight truncate ${winner === 'a' ? 'text-primary' : ''}`} style={{ color: winner !== 'a' ? match.teamA.color : undefined }}>
                                {match.teamA.name}
                              </h3>
                              {winner === 'a' && <Trophy className="h-4 w-4 text-yellow-500" />}
                            </div>
                            {/* Player Avatar Stack */}
                            <div className="flex items-center justify-center sm:justify-end -space-x-1.5 mt-2">
                              {match.teamA.players.slice(0, 6).map((p) => (
                                <Avatar key={p.id} className="h-6 w-6 border-2 border-black/80">
                                  <AvatarImage src={p.image} />
                                  <AvatarFallback className="text-[8px] font-bold bg-white/10">
                                    {p.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {match.teamA.players.length > 6 && (
                                <span className="text-[10px] font-bold text-muted-foreground ml-2">+{match.teamA.players.length - 6}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground mt-1 block">{match.teamA.players.length} Players</span>
                          </div>

                          {/* Score Display */}
                          <div className="flex items-center gap-4 min-w-[140px] justify-center relative z-10">
                            {editingMatchId === match.id ? (
                              <div className="flex items-center gap-2 bg-zinc-900/90 p-2 rounded-xl border border-white/10">
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
                                  <div className={`px-6 py-2 rounded-xl bg-black/40 border ${winner === 'draw' ? 'border-white/10' : 'border-primary/20'}`}>
                                    <div className="text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4">
                                      <span className={winner === 'a' ? 'text-primary' : 'text-white'}>
                                        {match.scoreA}
                                      </span>
                                      <span className="text-white/10 text-2xl sm:text-3xl">:</span>
                                      <span className={winner === 'b' ? 'text-primary' : 'text-white'}>
                                        {match.scoreB}
                                      </span>
                                    </div>
                                    {winner === 'draw' && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Draw</span>}
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
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                              {winner === 'b' && <Trophy className="h-4 w-4 text-yellow-500" />}
                              <h3 className={`font-black text-xl sm:text-2xl uppercase tracking-tight truncate ${winner === 'b' ? 'text-primary' : ''}`} style={{ color: winner !== 'b' ? match.teamB.color : undefined }}>
                                {match.teamB.name}
                              </h3>
                              <Shield className="h-4 w-4" style={{ color: match.teamB.color }} />
                            </div>
                            {/* Player Avatar Stack */}
                            <div className="flex items-center justify-center sm:justify-start -space-x-1.5 mt-2">
                              {match.teamB.players.slice(0, 6).map((p) => (
                                <Avatar key={p.id} className="h-6 w-6 border-2 border-black/80">
                                  <AvatarImage src={p.image} />
                                  <AvatarFallback className="text-[8px] font-bold bg-white/10">
                                    {p.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {match.teamB.players.length > 6 && (
                                <span className="text-[10px] font-bold text-muted-foreground ml-2">+{match.teamB.players.length - 6}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground mt-1 block">{match.teamB.players.length} Players</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-2 flex items-center gap-1 border-l border-white/10 bg-white/[0.02]">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/10 rounded-full"
                            onClick={() => toggleExpand(match.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-950/95 border-white/10">
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

                      {/* Expanded Lineup View */}
                      {isExpanded && (
                        <div className="border-t border-white/10 bg-black/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0">
                            {/* Team A Lineup */}
                            <div className="p-4 md:border-r border-white/10">
                              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: match.teamA.color }}>
                                <Shield className="h-3 w-3" />
                                {match.teamA.name} — Lineup
                              </h4>
                              <div className="space-y-1">
                                {match.teamA.players.map((player, i) => (
                                  <div key={player.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                                    <Avatar className="h-7 w-7 border border-white/10">
                                      <AvatarImage src={player.image} />
                                      <AvatarFallback className="text-[9px] font-bold bg-white/5">
                                        {player.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-bold truncate flex-1">{player.name}</span>
                                    {player.position && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: POSITION_COLORS[player.position], backgroundColor: `${POSITION_COLORS[player.position]}15` }}>
                                        {player.position}
                                      </span>
                                    )}
                                    <span className="text-xs font-mono font-bold text-muted-foreground">{calculateOverall(player.stats)}</span>
                                    {match.teamA.captainId === player.id && (
                                      <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-1.5 rounded">C</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Team B Lineup */}
                            <div className="p-4 border-t md:border-t-0 border-white/10">
                              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: match.teamB.color }}>
                                <Shield className="h-3 w-3" />
                                {match.teamB.name} — Lineup
                              </h4>
                              <div className="space-y-1">
                                {match.teamB.players.map((player, i) => (
                                  <div key={player.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                                    <Avatar className="h-7 w-7 border border-white/10">
                                      <AvatarImage src={player.image} />
                                      <AvatarFallback className="text-[9px] font-bold bg-white/5">
                                        {player.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-bold truncate flex-1">{player.name}</span>
                                    {player.position && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: POSITION_COLORS[player.position], backgroundColor: `${POSITION_COLORS[player.position]}15` }}>
                                        {player.position}
                                      </span>
                                    )}
                                    <span className="text-xs font-mono font-bold text-muted-foreground">{calculateOverall(player.stats)}</span>
                                    {match.teamB.captainId === player.id && (
                                      <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-1.5 rounded">C</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bench Players */}
                          {match.bench && match.bench.length > 0 && (
                            <div className="px-4 pb-4 border-t border-white/10">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mt-3 mb-2 flex items-center gap-1.5">
                                <Ban className="h-3 w-3" /> Bench ({match.bench.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {match.bench.map(p => (
                                  <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/10">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={p.image} />
                                      <AvatarFallback className="text-[7px] font-bold bg-white/5">
                                        {p.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[11px] font-bold text-amber-300/70">{p.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
