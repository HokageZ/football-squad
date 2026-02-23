'use client';

import { Match } from './types';
import { playNotificationRing } from './notification-sound';

// ─── Helpers ─────────────────────────────────────────────────────

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.ready;
}

function sendToSW(message: Record<string, unknown>): void {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

// ─── Permissions ─────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// ─── Schedule / cancel via Service Worker ────────────────────────

/**
 * Schedule a notification 1 hour before a match.
 * Delegates to the Service Worker so it fires even when the tab is
 * backgrounded or the screen is off.
 */
export function scheduleMatchNotification(match: Match): void {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (match.status === 'completed') return;

  const matchTime = new Date(match.date).getTime();
  const now = Date.now();

  // Skip matches in the past
  if (matchTime <= now) return;

  // Notify 1 hour before, or immediately if less than 1 hour away
  const notifyAt = Math.max(now, matchTime - 60 * 60 * 1000);

  sendToSW({
    type: 'SCHEDULE_NOTIFICATION',
    matchId: match.id,
    matchDate: match.date,
    teamAName: match.teamA.name,
    teamBName: match.teamB.name,
    notifyAt,
  });
}

export function cancelMatchNotification(matchId: string): void {
  if (typeof window === 'undefined') return;
  sendToSW({ type: 'CANCEL_NOTIFICATION', matchId });
}

// ─── Re-schedule on page load ────────────────────────────────────

/**
 * Re-send all upcoming match schedules to the Service Worker.
 * Called once on app init so the SW always has the latest data.
 */
export function rescheduleAllNotifications(matches: Match[]): void {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  matches.forEach((match) => {
    if (match.status === 'scheduled') {
      scheduleMatchNotification(match);
    }
  });

  // Also ask the SW to do an immediate check (in case any are already due)
  sendToSW({ type: 'CHECK_NOTIFICATIONS' });
}

// ─── Listen for SW messages (ringtone when tab is open) ──────────

let swListenerRegistered = false;

function registerSWMessageListener(): void {
  if (swListenerRegistered || typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  swListenerRegistered = true;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
      playNotificationRing();
    }
  });
}

// ─── Service Worker registration ─────────────────────────────────

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });

    // Listen for messages from SW (e.g. play sound)
    registerSWMessageListener();

    // Register Periodic Background Sync if available (Chrome/Edge Android).
    // This wakes the SW periodically so it can check & fire due notifications
    // even when the tab is completely closed.
    try {
      const periodicSync = (registration as unknown as { periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync;
      if (periodicSync) {
        await periodicSync.register('check-match-notifications', {
          minInterval: 15 * 60 * 1000, // 15 minutes
        });
      }
    } catch {
      // Periodic sync not available — the SW will still fire via
      // other wake-up events (push, sync, navigation)
    }

    // Also register a one-time background sync as fallback
    try {
      if ('sync' in registration) {
        await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('check-match-notifications');
      }
    } catch {
      // Background sync not available
    }
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}
