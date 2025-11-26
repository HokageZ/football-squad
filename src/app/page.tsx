'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Swords, TrendingUp, Award, ArrowRight, Plus, Activity, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayers } from '@/context/PlayerContext';
import { useMatches } from '@/context/MatchContext';
import { calculateOverall } from '@/lib/team-balancer';
import { STAT_KEYS, STAT_LABELS, STAT_COLORS } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { players, isLoading: playersLoading } = usePlayers();
  const { matches, isLoading: matchesLoading } = useMatches();

  if (playersLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const totalPlayers = players.length;
  const completedMatches = matches.filter(m => m.status === 'completed');
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  
  const averageOverall =
    totalPlayers > 0
      ? Math.round(
          (players.filter(p => !p.isUnknown).reduce((sum, p) => sum + calculateOverall(p.stats), 0) /
            (players.filter(p => !p.isUnknown).length || 1)) * // Prevent division by zero
            10
        ) / 10
      : 0;

  const topPlayers = [...players]
    .filter(p => !p.isUnknown)
    .sort((a, b) => calculateOverall(b.stats) - calculateOverall(a.stats))
    .slice(0, 5);

  const statAverages = STAT_KEYS.map((key) => ({
    key,
    label: STAT_LABELS[key],
    color: STAT_COLORS[key],
    average:
      players.filter(p => !p.isUnknown).length > 0
        ? Math.round(
            (players.filter(p => !p.isUnknown).reduce((sum, p) => sum + p.stats[key], 0) / players.filter(p => !p.isUnknown).length) *
              10
          ) / 10
        : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/20 to-blue-600/20 p-5 sm:p-8 md:p-12 lg:p-16 border border-white/10"
      >
        <div className="absolute inset-0 bg-[url('/pitch-pattern.svg')] opacity-10" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 max-w-2xl">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md">
            SQUAD HUB
          </Badge>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight">
            YOUR SQUAD <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              YOUR LEGACY
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 font-medium max-w-lg">
            Manage matches, track history, and build the ultimate lineup for your next game.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/teams">
              <Button size="lg" className="h-10 sm:h-12 px-5 sm:px-8 gap-2 rounded-full font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] transition-all">
                <Swords className="h-4 w-4 sm:h-5 sm:w-5" />
                Start Match
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="lg" variant="outline" className="h-10 sm:h-12 px-5 sm:px-8 gap-2 rounded-full border-white/20 bg-white/5 hover:bg-white/10 font-bold text-sm sm:text-base backdrop-blur-md">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Match History
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Matches Played</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-4xl font-black">{completedMatches.length}</div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {scheduledMatches.length} scheduled
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                {averageOverall}
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Squad Form
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Squad Size</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-4xl font-black truncate mb-1">
                {totalPlayers}
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Active Players
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</CardTitle>
              <Swords className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${totalPlayers >= 2 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
                <span className="font-bold text-sm sm:text-lg">
                    {totalPlayers >= 2 ? 'Match Ready' : 'Recruiting'}
                </span>
              </div>
               <p className="text-xs font-medium text-muted-foreground mt-1">
                {totalPlayers >= 2
                  ? 'Squads ready to deploy'
                  : `Need ${2 - totalPlayers} more`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  RECENT MATCHES
                </CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Latest Results</p>
              </div>
              <Link href="/matches">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/5">
                  View History
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {matches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No matches played yet</p>
                  <Link href="/teams">
                    <Button variant="link" className="mt-2 text-primary">
                      Create a Match
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map((match) => (
                    <div
                      key={match.id}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 bg-white/5"
                    >
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium">{new Date(match.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="hidden sm:inline">, {new Date(match.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-bold" style={{ color: match.teamA.color }}>{match.teamA.name}</span>
                        <div className="px-3 py-1 rounded bg-black/40 font-black text-lg tracking-widest">
                          {match.status === 'completed' ? `${match.scoreA} - ${match.scoreB}` : 'VS'}
                        </div>
                        <span className="font-bold" style={{ color: match.teamB.color }}>{match.teamB.name}</span>
                      </div>

                      <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'}>
                        {match.status === 'completed' ? 'FT' : 'SCH'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Players List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  LEADERBOARD
                </CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top Rated Players</p>
              </div>
              <Link href="/players">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/5">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {topPlayers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No players added yet</p>
                  <Link href="/players">
                    <Button variant="link" className="mt-2 text-primary">
                      Add your first player
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                    >
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full font-black text-sm
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                          index === 1 ? 'bg-slate-300/20 text-slate-300' :
                          index === 2 ? 'bg-orange-700/20 text-orange-700' : 'text-muted-foreground'}
                      `}>
                        {index + 1}
                      </div>
                      
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={player.image} />
                        <AvatarFallback className="bg-white/5 text-xs font-bold">
                          {player.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate group-hover:text-primary transition-colors">{player.name}</p>
                      </div>
                      
                      <div className="text-xl font-black italic text-muted-foreground group-hover:text-white transition-colors">
                        {calculateOverall(player.stats)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
