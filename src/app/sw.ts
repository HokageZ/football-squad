// Football Squad Service Worker
// Combines Serwist (offline precaching + runtime caching) with
// custom match-notification logic.

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ─── Serwist (offline) ───────────────────────────────────────────

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// ─── Match notifications (IndexedDB-backed) ──────────────────────

const DB_NAME = "football-squad-sw";
const DB_VERSION = 1;
const STORE_NAME = "match-schedules";

interface ScheduleRecord {
  matchId: string;
  matchDate: string;
  teamAName: string;
  teamBName: string;
  notifyAt: number;
  notified: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "matchId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbGetAll(db: IDBDatabase): Promise<ScheduleRecord[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as ScheduleRecord[]);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(db: IDBDatabase, record: ScheduleRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function dbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function checkAndFireNotifications(): Promise<void> {
  try {
    const db = await openDB();
    const schedules = await dbGetAll(db);
    const now = Date.now();

    for (const schedule of schedules) {
      const matchTime = new Date(schedule.matchDate).getTime();

      // Clean up matches that ended > 2 hours ago
      if (matchTime < now - 2 * 60 * 60 * 1000) {
        await dbDelete(db, schedule.matchId);
        continue;
      }

      if (!schedule.notified && schedule.notifyAt <= now) {
        const matchDate = new Date(schedule.matchDate);
        const timeStr = matchDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        await self.registration.showNotification("⚽ Match Starting Soon!", {
          body: `${schedule.teamAName} vs ${schedule.teamBName} kicks off at ${timeStr}`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `match-${schedule.matchId}`,
          requireInteraction: true,
          data: { matchId: schedule.matchId, url: "/matches" },
        } as NotificationOptions);

        schedule.notified = true;
        await dbPut(db, schedule);

        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => {
          client.postMessage({
            type: "PLAY_NOTIFICATION_SOUND",
            matchId: schedule.matchId,
          });
        });
      }
    }

    db.close();
  } catch (err) {
    console.error("[SW] checkAndFireNotifications error:", err);
  }
}

// ─── Message handler ────────────────────────────────────────────

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (!event.data) return;
  const { type } = event.data;

  if (type === "SCHEDULE_NOTIFICATION") {
    const { matchId, matchDate, teamAName, teamBName, notifyAt } = event.data;
    event.waitUntil(
      (async () => {
        const db = await openDB();
        await dbPut(db, {
          matchId,
          matchDate,
          teamAName,
          teamBName,
          notifyAt,
          notified: false,
        });
        db.close();
        await checkAndFireNotifications();
      })()
    );
  }

  if (type === "CANCEL_NOTIFICATION") {
    event.waitUntil(
      (async () => {
        const db = await openDB();
        await dbDelete(db, event.data.matchId);
        db.close();
      })()
    );
  }

  if (type === "CHECK_NOTIFICATIONS") {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── Background sync triggers ───────────────────────────────────

self.addEventListener("periodicsync", (event: Event) => {
  const e = event as ExtendableEvent & { tag: string };
  if (e.tag === "check-match-notifications") {
    e.waitUntil(checkAndFireNotifications());
  }
});

self.addEventListener("sync", (event: Event) => {
  const e = event as ExtendableEvent & { tag: string };
  if (e.tag === "check-match-notifications") {
    e.waitUntil(checkAndFireNotifications());
  }
});

// ─── Push (future server push support) ──────────────────────────

self.addEventListener("push", (event: PushEvent) => {
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(
        self.registration.showNotification(data.title || "⚽ Match Update", {
          body: data.body || "You have a match update!",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: { url: data.url || "/matches" },
        } as NotificationOptions)
      );
    } catch {
      event.waitUntil(checkAndFireNotifications());
    }
  } else {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── Notification click ─────────────────────────────────────────

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) || "/matches";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes("/matches") && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});

// ─── Activation: clean up old caches ────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(checkAndFireNotifications());
});
