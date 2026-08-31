// Thrown when `fetch` itself fails to reach the server (offline, DNS, etc.) —
// distinct from a normal HTTP error response, which means the server *was*
// reached and rejected the request. Only network errors are safe to queue
// and retry later (see state/operations.js); an HTTP error would just fail
// the same way again.
export class NetworkError extends Error {
  constructor() {
    super('offline');
    this.name = 'NetworkError';
  }
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new NetworkError();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getState: () => request('/state'),

  upsertUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  addExercise: (muscleGroup, name) =>
    request('/exercises', { method: 'POST', body: JSON.stringify({ muscleGroup, name }) }),
  removeExercise: (muscleGroup, name) =>
    request(`/exercises/${encodeURIComponent(muscleGroup)}/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  upsertWorkout: (id, payload) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),

  upsertEvent: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  upsertBodyWeight: (id, payload) => request(`/body-weights/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBodyWeight: (id) => request(`/body-weights/${id}`, { method: 'DELETE' }),

  importBackup: (payload) => request('/backup/import', { method: 'POST', body: JSON.stringify(payload) }),
};
