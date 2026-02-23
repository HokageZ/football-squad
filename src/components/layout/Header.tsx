'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, Swords, Calendar, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Trophy },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/teams', label: 'Teams', icon: Swords },
  { href: '/matches', label: 'Matches', icon: Calendar },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const [isInitial, setIsInitial] = useState(true);

  const measurePill = useCallback(() => {
    const nav = navRef.current;
    const activeEl = itemRefs.current.get(pathname);
    if (!nav || !activeEl) {
      setPillStyle(null);
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
    });
  }, [pathname]);

  useEffect(() => {
    measurePill();
    // After first measurement, enable transitions
    const timer = setTimeout(() => setIsInitial(false), 50);
    return () => clearTimeout(timer);
  }, [measurePill]);

  // Re-measure on resize
  useEffect(() => {
    window.addEventListener('resize', measurePill);
    return () => window.removeEventListener('resize', measurePill);
  }, [measurePill]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-zinc-950/95 px-4 py-3 shadow-2xl ring-1 ring-white/5 relative z-50">
          <Link href="/" className="flex items-center gap-3 group shrink-0 pl-2">
            <Logo className="text-primary group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none text-white group-hover:text-primary transition-colors">
                SQUAD
              </span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
                Manager
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav ref={navRef} className="hidden sm:flex items-center gap-1 relative">
            {/* Animated pill - positioned relative to nav container */}
            {pillStyle && (
              <motion.div
                className="absolute top-0 h-full bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                animate={{ left: pillStyle.left, width: pillStyle.width }}
                transition={isInitial ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  ref={(el) => {
                    if (el) itemRefs.current.set(href, el);
                  }}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors duration-300',
                    isActive
                      ? 'text-black'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn("h-4 w-4 relative z-10", isActive ? "text-black" : "text-current")} />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden relative z-50 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-colors hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Full Screen Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-zinc-950/98 sm:hidden flex flex-col pt-32 px-6"
            >
              <nav className="flex flex-col gap-4">
                {navItems.map(({ href, label, icon: Icon }, index) => {
                  const isActive = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl text-xl font-black tracking-tight transition-colors border',
                          isActive
                            ? 'bg-primary text-black border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]'
                            : 'text-white border-white/10 hover:bg-white/5'
                        )}
                      >
                        <Icon className={cn("h-6 w-6", isActive ? "text-black" : "text-primary")} />
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              
              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white/20 text-sm font-bold tracking-widest uppercase">
                Squad Manager v1.0
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

