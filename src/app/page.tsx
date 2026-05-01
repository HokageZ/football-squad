'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  Swords,
  Award,
  ArrowRight,
  Calendar,
  Trophy,
  Activity,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/context/PlayerContext';
import { useMatches } from '@/context/MatchContext';
import { calculateOverall } from '@/lib/team-balancer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ─── Variants ────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 24 },
  },
};

// ─── Tiny helpers ────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  icon: React.ElementType;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 pb-5 border-b border-white/5">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 mt-1">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {linkLabel}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { players, isLoading: playersLoading } = usePlayers();
  const { matches, isLoading: matchesLoading } = useMatches();

  if (playersLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const totalPlayers = players.length;
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');

  const averageOverall =
    totalPlayers > 0
      ? Math.round(
          (players.filter((p) => !p.isUnknown).reduce((sum, p) => sum + calculateOverall(p.stats), 0) /
            (players.filter((p) => !p.isUnknown).length || 1)) *
            10
        ) / 10
      : 0;

  const topPlayers = [...players]
    .filter((p) => !p.isUnknown)
    .sort((a, b) => calculateOverall(b.stats) - calculateOverall(a.stats))
    .slice(0, 5);

  const isReady = totalPlayers >= 2;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="relative p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div
            className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 0%, rgba(16,185,129,0.55), transparent 55%)',
            }}
          />

          <div className="relative p-6 sm:p-10 md:p-14 lg:p-20 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Squad Command Center
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-5 tracking-tighter leading-[0.88]">
              BUILD YOUR
              <br />
              <span className="text-primary">DREAM TEAM.</span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-8 font-medium max-w-md leading-relaxed">
              Track every stat, balance lineups on the fly, and schedule kickoffs with push alerts.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/teams">
                <Button
                  size="lg"
                  className="group rounded-full font-bold pl-6 pr-2 py-1 h-12 shadow-lg shadow-primary/20 text-sm"
                >
                  <Swords className="mr-2 h-4 w-4" />
                  Build squad
                  <span className="ml-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/20 transition-transform group-hover:translate-x-0.5">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link href="/matches">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-6 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-sm font-bold"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Match history
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats row (Doppelrand tiles) ─────────────────────── */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile
          variants={item}
          label="Matches"
          value={completedMatches.length}
          hint={`${scheduledMatches.length} scheduled`}
          Icon={Trophy}
          accent="text-yellow-400"
        />
        <StatTile
          variants={item}
          label="Avg rating"
          value={averageOverall}
          hint="Squad form"
          Icon={Activity}
          accent="text-primary"
          showDecimal
        />
        <StatTile
          variants={item}
          label="Squad size"
          value={totalPlayers}
          hint="Active players"
          Icon={Users}
          accent="text-blue-400"
        />
        <StatTile
          variants={item}
          label="Status"
          value={isReady ? 'Ready' : 'Recruit'}
          hint={isReady ? 'Deployable' : 'Need players'}
          Icon={isReady ? CheckCircle2 : Swords}
          accent={isReady ? 'text-emerald-400' : 'text-rose-400'}
          isString
        />
      </div>

      {/* ─── Main split ──────────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-12">
        {/* Recent Matches */}
        <motion.div variants={item} className="md:col-span-7">
          <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/8 h-full">
            <div className="relative rounded-[calc(1.75rem-0.375rem)] bg-zinc-950/60 border border-white/5 p-5 h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <SectionHeader
                eyebrow="Recent Action"
                title="Match results"
                icon={Trophy}
                href="/matches"
                linkLabel="View all"
              />

              {matches.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No matches yet"
                  hint="Set up your first fixture and start tracking"
                  ctaLabel="Schedule match"
                  ctaHref="/teams"
                />
              ) : (
                <div className="space-y-2 pt-5">
                  {[...matches]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 4)
                    .map((match) => {
                      const isDone = match.status === 'completed';
                      const a = match.scoreA ?? 0;
                      const b = match.scoreB ?? 0;
                      const aWin = isDone && a > b;
                      const bWin = isDone && b > a;
                      return (
                        <div
                          key={match.id}
                          className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 transition-colors"
                        >
                          <div className="shrink-0 flex flex-col items-start gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                              {new Date(match.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isDone
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-white/5 text-muted-foreground border border-white/10'
                              }`}
                            >
                              {isDone ? 'FT' : 'UP'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-3 justify-end">
                            <span
                              className={`font-bold text-sm truncate text-right flex-1 ${
                                aWin ? '' : bWin ? 'text-muted-foreground' : ''
                              }`}
                              style={{ color: aWin ? match.teamA.color : undefined }}
                            >
                              {match.teamA.name}
                            </span>
                          </div>

                          <div className="shrink-0 px-2.5 py-1 rounded-lg bg-black/40 border border-white/8 font-mono font-black text-base tracking-tight min-w-[70px] text-center">
                            {isDone ? (
                              <>
                                <span className={aWin ? 'text-primary' : 'text-white/80'}>{a}</span>
                                <span className="text-white/20 mx-1">·</span>
                                <span className={bWin ? 'text-primary' : 'text-white/80'}>{b}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-xs tracking-[0.2em]">VS</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-bold text-sm truncate block ${
                                bWin ? '' : aWin ? 'text-muted-foreground' : ''
                              }`}
                              style={{ color: bWin ? match.teamB.color : undefined }}
                            >
                              {match.teamB.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Players */}
        <motion.div variants={item} className="md:col-span-5">
          <div className="relative p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/8 h-full">
            <div className="relative rounded-[calc(1.75rem-0.375rem)] bg-zinc-950/60 border border-white/5 p-5 h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <SectionHeader
                eyebrow="Squad Leaders"
                title="Top performers"
                icon={Award}
                href="/players"
                linkLabel="All players"
              />

              {topPlayers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No players yet"
                  hint="Sign your first player to see top performers"
                  ctaLabel="Recruit"
                  ctaHref="/players"
                />
              ) : (
                <div className="space-y-1.5 pt-5">
                  {topPlayers.map((player, index) => {
                    const ovr = calculateOverall(player.stats);
                    const ovrColor =
                      ovr >= 85
                        ? 'text-yellow-400'
                        : ovr >= 75
                        ? 'text-emerald-400'
                        : ovr >= 65
                        ? 'text-blue-400'
                        : 'text-zinc-300';
                    const rankAccent =
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-zinc-300'
                        : index === 2
                        ? 'bg-orange-700'
                        : 'bg-white/10';
                    return (
                      <Link
                        key={player.id}
                        href="/players"
                        className="group relative flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                      >
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${rankAccent}`}
                          aria-hidden
                        />
                        <span className="shrink-0 w-6 text-center font-mono font-bold text-xs text-muted-foreground/70 pl-1">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Avatar className="h-10 w-10 border border-white/10 ring-1 ring-inset ring-white/5">
                          <AvatarImage src={player.image} />
                          <AvatarFallback className="bg-zinc-900 text-sm font-black text-muted-foreground">
                            {player.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-sm group-hover:text-primary transition-colors">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider mt-0.5">
                            <span>{player.position || 'FREE'}</span>
                            {player.tags && player.tags.length > 0 && (
                              <>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="truncate">{player.tags[0]}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-mono font-black italic text-xl leading-none tracking-tight ${ovrColor}`}
                          >
                            {ovr}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mt-0.5">
                            OVR
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── StatTile (Doppelrand) ───────────────────────────────────────

function StatTile({
  label,
  value,
  hint,
  Icon,
  accent,
  isString,
  showDecimal,
  variants,
}: {
  label: string;
  value: number | string;
  hint: string;
  Icon: React.ElementType;
  accent: string;
  isString?: boolean;
  showDecimal?: boolean;
  variants: Variants;
}) {
  return (
    <motion.div variants={variants}>
      <div className="relative p-1 rounded-2xl bg-white/[0.03] border border-white/8 h-full">
        <div className="relative rounded-[calc(1rem-0.125rem)] bg-zinc-950/60 border border-white/5 p-4 h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Icon className={`absolute -top-3 -right-3 h-20 w-20 opacity-[0.04] ${accent}`} />

          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <Icon className={`h-3.5 w-3.5 ${accent}`} />
          </div>

          <div
            className={`relative font-mono font-black tracking-tighter leading-none ${
              isString ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            } ${accent}`}
          >
            {isString
              ? value
              : showDecimal
              ? Number(value).toFixed(1)
              : value}
          </div>
          <p className="relative text-[10px] font-medium text-muted-foreground/70 mt-1.5">
            {hint}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  hint,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ElementType;
  title: string;
  hint: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="text-center py-10 mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
      <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/8 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-bold text-sm mb-0.5">{title}</p>
      <p className="text-xs text-muted-foreground/80 mb-4 font-medium max-w-[220px] mx-auto">
        {hint}
      </p>
      <Link
        href={ctaHref}
        className="group inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary/15 transition-colors"
      >
        {ctaLabel}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
