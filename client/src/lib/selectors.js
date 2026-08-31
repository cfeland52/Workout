// Ported from Workout-Book.html's "data queries" section (docs/legacy/Workout-Book.html:622-676).
// Each function takes `state` (the server-backed data blob) explicitly instead of
// reading a global, since React owns that data via context now.
import { pad2, todayStr, daysAgoStr } from './dateUtils.js';

export function userWorkouts(state, userId) {
  return state.workouts.filter((w) => w.userId === userId);
}
export function userEvents(state, userId) {
  return state.events.filter((e) => e.userId === userId);
}
export function workoutsOnDate(state, userId, date) {
  return userWorkouts(state, userId).filter((w) => w.date === date);
}
export function eventsOnDate(state, userId, date) {
  return userEvents(state, userId).filter((e) => e.date === date);
}
export function monthWorkoutCount(state, userId, y, m) {
  const prefix = `${y}-${pad2(m)}`;
  return userWorkouts(state, userId).filter((w) => w.date.indexOf(prefix) === 0).length;
}
export function userBodyWeights(state, userId) {
  return (state.bodyWeights || []).filter((b) => b.userId === userId);
}
export function standaloneBodyWeightFor(state, userId, date) {
  return userBodyWeights(state, userId).find((b) => b.date === date) || null;
}
export function bodyWeightEntries(state, userId) {
  const byDate = {};
  userWorkouts(state, userId).forEach((w) => {
    if (w.bodyWeight !== null && w.bodyWeight !== undefined && w.bodyWeight !== '') {
      byDate[w.date] = { date: w.date, weight: Number(w.bodyWeight), source: 'workout' };
    }
  });
  userBodyWeights(state, userId).forEach((b) => {
    if (!byDate[b.date]) byDate[b.date] = { date: b.date, weight: Number(b.weight), source: 'standalone' };
  });
  return Object.values(byDate).sort((a, b) => (a.date < b.date ? -1 : 1));
}
export function weeklyAvgBodyWeight(state, userId) {
  const entries = bodyWeightEntries(state, userId);
  if (!entries.length) return null;
  const today = todayStr(), start = daysAgoStr(6);
  const inWindow = entries.filter((e) => e.date >= start && e.date <= today);
  if (inWindow.length) {
    const sum = inWindow.reduce((a, e) => a + e.weight, 0);
    return { avg: sum / inWindow.length, count: inWindow.length, mode: 'week' };
  }
  const last = entries[entries.length - 1];
  return { avg: last.weight, count: 1, mode: 'last', date: last.date };
}
export function recentTemplates(state, userId, category, excludeId) {
  return userWorkouts(state, userId)
    .filter((w) => w.category === category && w.id !== excludeId && w.blocks && w.blocks.length)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);
}
export function exerciseGroupOf(state, name) {
  const groups = Object.keys(state.exercises);
  for (const g of groups) {
    if (state.exercises[g].includes(name)) return g;
  }
  return null;
}
export function allExerciseNames(state) {
  const set = new Set();
  Object.keys(state.exercises).forEach((g) => state.exercises[g].forEach((n) => set.add(n)));
  return Array.from(set).sort();
}
export function initials(name) {
  return (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
