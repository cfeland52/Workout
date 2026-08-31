// Local persistence for offline use: the last-known server state (so the app
// has something to render with zero connectivity) and a queue of mutations
// made while offline, replayed against the server once it's reachable again.
const STATE_KEY = 'workoutbook_cache_v1';
const OUTBOX_KEY = 'workoutbook_outbox_v1';

export function loadCachedState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — the in-memory
    // state still works for this session, it just won't survive a reload.
  }
}

export function loadOutbox() {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOutbox(ops) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(ops));
  } catch {
    // Same as above — best effort.
  }
}
