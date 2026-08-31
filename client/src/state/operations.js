// A "operation" describes one user-initiated change in a form the app can
// both apply immediately to its local state (optimistic update, works
// offline) and send to the server — the exact same shape is replayed later
// from the outbox queue if it couldn't be sent right away. Keeping both in
// one place (rather than scattered across components) means there's exactly
// one definition of what each kind of change does.
import { api } from '../api/client.js';

const COLLECTION_BY_ENTITY = {
  workout: 'workouts',
  event: 'events',
  bodyWeight: 'bodyWeights',
};

export function applyLocal(state, op) {
  const next = structuredClone(state);

  if (op.entity === 'user' && op.action === 'upsert') {
    const idx = next.users.findIndex((u) => u.id === op.id);
    const record = { ...op.payload, id: op.id };
    if (idx === -1) next.users.push(record); else next.users[idx] = record;
    return next;
  }

  if (op.entity === 'exercise') {
    if (!next.exercises[op.muscleGroup]) next.exercises[op.muscleGroup] = [];
    if (op.action === 'add') {
      if (!next.exercises[op.muscleGroup].includes(op.name)) next.exercises[op.muscleGroup].push(op.name);
    } else if (op.action === 'remove') {
      next.exercises[op.muscleGroup] = next.exercises[op.muscleGroup].filter((n) => n !== op.name);
    }
    return next;
  }

  const collection = COLLECTION_BY_ENTITY[op.entity];
  if (collection) {
    if (op.action === 'upsert') {
      const idx = next[collection].findIndex((x) => x.id === op.id);
      const record = { ...op.payload, id: op.id };
      if (idx === -1) next[collection].push(record); else next[collection][idx] = record;
    } else if (op.action === 'delete') {
      next[collection] = next[collection].filter((x) => x.id !== op.id);
    }
  }

  return next;
}

export function sendRemote(op) {
  if (op.entity === 'user' && op.action === 'upsert') return api.upsertUser(op.id, op.payload);
  if (op.entity === 'exercise' && op.action === 'add') return api.addExercise(op.muscleGroup, op.name);
  if (op.entity === 'exercise' && op.action === 'remove') return api.removeExercise(op.muscleGroup, op.name);
  if (op.entity === 'workout' && op.action === 'upsert') return api.upsertWorkout(op.id, op.payload);
  if (op.entity === 'workout' && op.action === 'delete') return api.deleteWorkout(op.id);
  if (op.entity === 'event' && op.action === 'upsert') return api.upsertEvent(op.id, op.payload);
  if (op.entity === 'event' && op.action === 'delete') return api.deleteEvent(op.id);
  if (op.entity === 'bodyWeight' && op.action === 'upsert') return api.upsertBodyWeight(op.id, op.payload);
  if (op.entity === 'bodyWeight' && op.action === 'delete') return api.deleteBodyWeight(op.id);
  throw new Error(`Unknown operation: ${op.entity}/${op.action}`);
}
