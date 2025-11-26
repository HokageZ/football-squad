'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, Swords, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Trophy },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: Swords },
  { href: '/matches', label: 'Matches', icon: Calendar },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4 flex h-14 sm:h-16 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="relative p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary to-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.8)] transition-all duration-300">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-lg tracking-tight leading-none">
              FOOTBALL
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest">
              SQUAD
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 bg-black/20 p-0.5 sm:p-1 rounded-full border border-white/5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/20 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                <span className="hidden sm:inline-block relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

