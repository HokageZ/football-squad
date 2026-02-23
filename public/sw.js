// Football Squad Service Worker — Background Match Notifications
// Uses IndexedDB to store schedules so notifications fire even when
// the tab is backgrounded or the phone screen is off.

const DB_NAME = 'football-squad-sw';
const DB_VERSION = 1;
const STORE_NAME = 'match-schedules';

// ─── IndexedDB helpers ───────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'matchId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbGetAll(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbDelete(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Core: check schedules & fire notifications ──────────────────

async function checkAndFireNotifications() {
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

      // Fire notification if it's due and hasn't been sent
      if (!schedule.notified && schedule.notifyAt <= now) {
        const matchDate = new Date(schedule.matchDate);
        const timeStr = matchDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        await self.registration.showNotification('⚽ Match Starting Soon!', {
          body: `${schedule.teamAName} vs ${schedule.teamBName} kicks off at ${timeStr}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `match-${schedule.matchId}`,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200, 300, 200, 100, 200, 100, 200],
          data: { matchId: schedule.matchId, url: '/matches' },
        });

        // Mark as sent
        schedule.notified = true;
        await dbPut(db, schedule);

        // Tell any open clients to play the ringtone sound
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => {
          client.postMessage({
            type: 'PLAY_NOTIFICATION_SOUND',
            matchId: schedule.matchId,
          });
        });
      }
    }

    db.close();
  } catch (err) {
    console.error('[SW] checkAndFireNotifications error:', err);
  }
}

// ─── Lifecycle events ────────────────────────────────────────────

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => checkAndFireNotifications())
  );
});

// ─── Message handler (main thread → SW) ─────────────────────────

self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type } = event.data;

  if (type === 'SCHEDULE_NOTIFICATION') {
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

  if (type === 'CANCEL_NOTIFICATION') {
    event.waitUntil(
      (async () => {
        const db = await openDB();
        await dbDelete(db, event.data.matchId);
        db.close();
      })()
    );
  }

  if (type === 'CHECK_NOTIFICATIONS') {
    event.waitUntil(checkAndFireNotifications());
  }

  // Legacy: direct notification request from main thread
  if (type === 'SHOW_NOTIFICATION') {
    const { title, body, matchId } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `match-${matchId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 300, 200, 100, 200, 100, 200],
        data: { matchId, url: '/matches' },
      })
    );
  }
});

// ─── Periodic Background Sync (Chrome / Edge on Android) ────────

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-match-notifications') {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── One-time Background Sync ───────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'check-match-notifications') {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── Push event (future: works with a push server) ──────────────

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(
        self.registration.showNotification(data.title || '⚽ Match Update', {
          body: data.body || 'You have a match update!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200, 100, 200, 300, 200, 100, 200, 100, 200],
          data: { url: data.url || '/matches' },
        })
      );
    } catch {
      event.waitUntil(checkAndFireNotifications());
    }
  } else {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── Notification click ─────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/matches';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes('/matches') && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
