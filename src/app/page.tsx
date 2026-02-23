'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Users, Swords, TrendingUp, Award, ArrowRight, Calendar, Trophy, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayers } from '@/context/PlayerContext';
import { useMatches } from '@/context/MatchContext';
import { calculateOverall } from '@/lib/team-balancer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
    }
  },
};

export default function DashboardPage() {
  const { players, isLoading: playersLoading } = usePlayers();
  const { matches, isLoading: matchesLoading } = useMatches();

  if (playersLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
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
          (players.filter(p => !p.isUnknown).length || 1)) *
        10
      ) / 10
      : 0;

  const topPlayers = [...players]
    .filter(p => !p.isUnknown)
    .sort((a, b) => calculateOverall(b.stats) - calculateOverall(a.stats))
    .slice(0, 5);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Hero Section */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl group"
      >
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div
          className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />

        <div className="relative z-20 p-6 sm:p-10 md:p-14 lg:p-20 max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Zap className="h-3 w-3 fill-current" />
            Next Gen Squad Management
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9]">
            BUILD YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
              DREAM TEAM
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 font-medium max-w-lg leading-relaxed">
            Analyze performance, manage lineups, and dominate the pitch with advanced squad analytics.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/teams">
              <Button size="lg" className="h-14 px-8 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                <Swords className="mr-2 h-5 w-5" />
                Start Match
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 font-bold text-base text-white hover:text-white hover:border-white/20">
                <Calendar className="mr-2 h-5 w-5" />
                History
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Matches Played', value: completedMatches.length, sub: `${scheduledMatches.length} scheduled`, icon: Trophy, color: 'text-yellow-500' },
          { title: 'Avg Rating', value: averageOverall, sub: 'Squad Form', icon: Activity, color: 'text-primary' },
          { title: 'Squad Size', value: totalPlayers, sub: 'Active Players', icon: Users, color: 'text-blue-400' },
          { title: 'Status', value: totalPlayers >= 2 ? 'Ready' : 'Recruiting', sub: totalPlayers >= 2 ? 'Deployable' : 'Need Players', icon: Swords, color: totalPlayers >= 2 ? 'text-emerald-400' : 'text-rose-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="glass group hover:bg-white/5 transition-colors duration-300 border-white/5 hover:border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className={`h-16 w-16 ${stat.color}`} />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.color} drop-shadow-lg`}>
                  {stat.value}
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Recent Matches - Spans 7 cols */}
        <motion.div variants={item} className="md:col-span-7">
          <Card className="glass h-full border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  RECENT ACTION
                </CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Match Results</p>
              </div>
              <Link href="/matches">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/5 text-xs uppercase font-bold tracking-wider">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {matches.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No matches recorded</p>
                  <Link href="/teams">
                    <Button variant="link" className="mt-2 text-primary">
                      Setup a Match
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map((match) => (
                    <div
                      key={match.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'} className="w-fit text-[10px] h-5">
                          {match.status === 'completed' ? 'FT' : 'UPCOMING'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 flex-1 justify-center">
                        <div className="text-right flex-1">
                          <span className="font-bold block text-sm sm:text-base truncate" style={{ color: match.teamA.color }}>{match.teamA.name}</span>
                        </div>

                        <div className="px-4 py-1.5 rounded-lg bg-black/40 font-black text-lg sm:text-xl tracking-widest min-w-[80px] text-center border border-white/5">
                          {match.status === 'completed' ? (
                            <span className={(match.scoreA ?? 0) > (match.scoreB ?? 0) ? 'text-primary' : (match.scoreB ?? 0) > (match.scoreA ?? 0) ? 'text-muted-foreground' : 'text-white'}>
                              {match.scoreA ?? 0} <span className="text-white/20">-</span> {match.scoreB ?? 0}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">VS</span>
                          )}
                        </div>

                        <div className="text-left flex-1">
                          <span className="font-bold block text-sm sm:text-base truncate" style={{ color: match.teamB.color }}>{match.teamB.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Players - Spans 5 cols */}
        <motion.div variants={item} className="md:col-span-5">
          <Card className="glass h-full border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  TOP PERFORMERS
                </CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Squad Leaders</p>
              </div>
              <Link href="/players">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/5 text-xs uppercase font-bold tracking-wider">
                  All Players
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {topPlayers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No players found</p>
                  <Link href="/players">
                    <Button variant="link" className="mt-2 text-primary">
                      Add Player
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 relative overflow-hidden"
                    >
                      {/* Rank Indicator */}
                      <div className={`
                        absolute left-0 top-0 bottom-0 w-1 
                        ${index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-slate-300' :
                            index === 2 ? 'bg-orange-700' : 'bg-transparent'}
                      `} />

                      <div className="font-black text-lg text-white/20 w-6 text-center">
                        {index + 1}
                      </div>

                      <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={player.image} />
                        <AvatarFallback className="bg-white/10 font-bold">
                          {player.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-base group-hover:text-primary transition-colors">{player.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{player.position || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-2xl font-black italic text-white group-hover:text-primary transition-colors leading-none">
                          {calculateOverall(player.stats)}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OVR</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
