// Ported from Workout-Book.html's workout-builder draft helpers
// (docs/legacy/Workout-Book.html:1043-1057, 1196-1207, 1363-1364).
import { nowTimeStr, todayStr } from './dateUtils.js';

export function newDraft(date) {
  return {
    editingId: null, date: date || todayStr(), startTime: nowTimeStr(), endTime: null,
    category: 'Upper', bodyWeight: '', notes: '', blocks: [], cardio: [], step: 'setup',
  };
}

export function draftFromWorkout(w) {
  const d = structuredClone(w);
  d.editingId = w.id;
  d.step = 'build';
  d.bodyWeight = (w.bodyWeight === null || w.bodyWeight === undefined) ? '' : String(w.bodyWeight);
  if (!d.cardio) d.cardio = [];
  if (!d.blocks) d.blocks = [];
  if (!d.notes) d.notes = '';
  return d;
}

export function cloneBlocksAsTemplate(blocks) {
  const copy = structuredClone(blocks || []);
  copy.forEach((b) => {
    b.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.isDrop) s.stages.forEach((st) => { st.stale = true; });
        else s.stale = true;
      });
    });
  });
  return copy;
}

export function emptySet() { return { reps: '', weight: '' }; }
export function emptySlot() { return { name: '', muscleGroup: 'Chest', sets: [emptySet()] }; }

// Reads a form field by id directly from the DOM, same as the original
// app's `val(id)` helper — used for the few plain (uncontrolled) inputs
// in the builder that are only read on step transition, not on every keystroke.
export function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
