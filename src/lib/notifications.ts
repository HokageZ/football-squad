'use client';

import { Match } from './types';
import { getStoredNotificationSchedule, setStoredNotificationSchedule } from './storage';

const NOTIFICATION_TIMERS: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Request browser notification permission.
 * Returns true if permission is granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Check if notifications are supported and permission is granted
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Schedule a notification 1 hour before a match.
 * If the match is less than 1 hour away, notify immediately.
 * If the match is in the past, skip.
 */
export function scheduleMatchNotification(match: Match): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (match.status === 'completed') return;

  const matchTime = new Date(match.date).getTime();
  const now = Date.now();
  const oneHourBefore = matchTime - 60 * 60 * 1000;

  // If match is in the past, skip
  if (matchTime <= now) return;

  // Calculate delay: either 1hr before or immediately if less than 1hr away
  const delay = Math.max(0, oneHourBefore - now);

  // Cancel any existing timer for this match
  cancelMatchNotification(match.id);

  // Set the timer
  const timerId = setTimeout(() => {
    showMatchNotification(match);
    // Clean up from schedule
    const schedule = getStoredNotificationSchedule();
    delete schedule[match.id];
    setStoredNotificationSchedule(schedule);
  }, delay);

  NOTIFICATION_TIMERS[match.id] = timerId;

  // Store in localStorage so we can re-schedule on page reload
  const schedule = getStoredNotificationSchedule();
  schedule[match.id] = match.date;
  setStoredNotificationSchedule(schedule);
}

/**
 * Cancel a scheduled notification for a match
 */
export function cancelMatchNotification(matchId: string): void {
  if (NOTIFICATION_TIMERS[matchId]) {
    clearTimeout(NOTIFICATION_TIMERS[matchId]);
    delete NOTIFICATION_TIMERS[matchId];
  }

  const schedule = getStoredNotificationSchedule();
  delete schedule[matchId];
  setStoredNotificationSchedule(schedule);
}

/**
 * Show the actual notification
 */
function showMatchNotification(match: Match): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const matchDate = new Date(match.date);
  const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const title = '⚽ Match Starting Soon!';
  const body = `${match.teamA.name} vs ${match.teamB.name} kicks off at ${timeStr}`;

  try {
    // Try service worker notification first (works in background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        matchId: match.id,
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `match-${match.id}`,
        requireInteraction: true,
      });
    }
  } catch (error) {
    console.error('Failed to show notification:', error);
    // Last resort: use regular Notification API
    try {
      new Notification(title, { body, tag: `match-${match.id}` });
    } catch {
      // Silent fail
    }
  }
}

/**
 * Re-schedule all pending notifications on page load.
 * Call this when the app initializes.
 */
export function rescheduleAllNotifications(matches: Match[]): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const schedule = getStoredNotificationSchedule();
  
  // Clean up old entries and re-schedule active ones
  const newSchedule: Record<string, string> = {};

  Object.entries(schedule).forEach(([matchId, dateStr]) => {
    const match = matches.find(m => m.id === matchId);
    if (match && match.status === 'scheduled') {
      const matchTime = new Date(match.date).getTime();
      if (matchTime > Date.now()) {
        scheduleMatchNotification(match);
        newSchedule[matchId] = dateStr;
      }
    }
  });

  setStoredNotificationSchedule(newSchedule);
}

/**
 * Register the service worker for background notifications
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}
