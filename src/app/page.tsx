'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Swords, TrendingUp, Award, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayers } from '@/context/PlayerContext';
import { calculateOverall } from '@/lib/team-balancer';
import { STAT_KEYS, STAT_LABELS, STAT_COLORS } from '@/lib/types';

export default function DashboardPage() {
  const { players, isLoading } = usePlayers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const totalPlayers = players.length;
  const averageOverall =
    totalPlayers > 0
      ? Math.round(
          (players.reduce((sum, p) => sum + calculateOverall(p.stats), 0) /
            totalPlayers) *
            10
        ) / 10
      : 0;

  const topPlayers = [...players]
    .sort((a, b) => calculateOverall(b.stats) - calculateOverall(a.stats))
    .slice(0, 5);

  const statAverages = STAT_KEYS.map((key) => ({
    key,
    label: STAT_LABELS[key],
    color: STAT_COLORS[key],
    average:
      totalPlayers > 0
        ? Math.round(
            (players.reduce((sum, p) => sum + p.stats[key], 0) / totalPlayers) *
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-12"
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Football Squad
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">
            Manage your players, track their stats, and create perfectly balanced
            teams for your matches.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/players">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Players
              </Button>
            </Link>
            <Link href="/teams">
              <Button size="lg" variant="outline" className="gap-2">
                <Swords className="h-5 w-5" />
                Build Teams
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                {totalPlayers === 0
                  ? 'Add players to get started'
                  : `${Math.floor(totalPlayers / 2)} per team`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{averageOverall}</div>
              <p className="text-xs text-muted-foreground">
                Squad overall rating
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Player</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">
                {topPlayers[0]?.name || '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {topPlayers[0]
                  ? `${calculateOverall(topPlayers[0].stats)} overall`
                  : 'No players yet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Ready</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalPlayers >= 2 ? '2' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPlayers >= 2
                  ? 'Ready to play'
                  : `Need ${2 - totalPlayers} more players`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Top Players
              </CardTitle>
              <Link href="/players">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {topPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No players added yet</p>
                  <Link href="/players">
                    <Button variant="link" className="mt-2">
                      Add your first player
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{player.name}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-primary font-bold"
                      >
                        {calculateOverall(player.stats)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Squad Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Squad Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalPlayers === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Add players to see stats</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {statAverages.map((stat) => (
                    <div key={stat.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground uppercase tracking-wider">
                          {stat.label}
                        </span>
                        <span className="font-bold" style={{ color: stat.color }}>
                          {stat.average}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.average / 10) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Ready to play?
                </h3>
                <p className="text-muted-foreground">
                  {totalPlayers >= 2
                    ? 'Create balanced teams and start your match!'
                    : 'Add more players to start building teams.'}
                </p>
              </div>
              <Link href={totalPlayers >= 2 ? '/teams' : '/players'}>
                <Button size="lg" className="gap-2 whitespace-nowrap">
                  {totalPlayers >= 2 ? (
                    <>
                      <Swords className="h-5 w-5" />
                      Create Teams
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add Players
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
