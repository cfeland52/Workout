// Persists the workout currently being built so it survives the phone's
// browser tab getting suspended or killed while backgrounded (very common
// mid-workout at the gym — switch to a music app, come back, and without
// this the whole in-progress workout was gone, since it only ever lived in
// React state). Cleared once the workout is actually saved.
const KEY = 'workoutbook_inprogress_v1';

// `modal` is the exact ui.modal spec that opened the builder
// ({type:'workoutBuilder', date} or {type:'workoutBuilder', editingId}) —
// used to tell "still the same in-progress workout" from "a different one
// was opened since," so a stale draft doesn't leak into an unrelated one.
export function loadInProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveInProgress(modal, userId, draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ modal, userId, draft }));
  } catch {
    // Best effort — losing the safety net is better than crashing the app.
  }
}

export function clearInProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function sameModalSpec(a, b) {
  if (!a || !b) return false;
  return a.type === b.type && a.date === b.date && a.editingId === b.editingId;
}
