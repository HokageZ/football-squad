'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, Swords, Calendar, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-4 py-3 shadow-2xl ring-1 ring-white/5">
          <Link href="/" className="flex items-center gap-3 group shrink-0 pl-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] group-hover:scale-110">
              <Trophy className="h-5 w-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none text-white group-hover:text-primary transition-colors">
                SQUAD
              </span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
                Manager
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
                    isActive
                      ? 'text-black'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("h-4 w-4 relative z-10", isActive ? "text-black" : "text-current")} />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-colors hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-2 shadow-2xl">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                      isActive
                        ? 'bg-primary text-black'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

