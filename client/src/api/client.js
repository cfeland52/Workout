async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getState: () => request('/state'),

  createUser: (name) => request('/users', { method: 'POST', body: JSON.stringify({ name }) }),

  addExercise: (muscleGroup, name) =>
    request('/exercises', { method: 'POST', body: JSON.stringify({ muscleGroup, name }) }),
  removeExercise: (muscleGroup, name) =>
    request(`/exercises/${encodeURIComponent(muscleGroup)}/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  createWorkout: (workout) => request('/workouts', { method: 'POST', body: JSON.stringify(workout) }),
  updateWorkout: (id, workout) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(workout) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),

  createEvent: (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, event) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  createBodyWeight: (entry) => request('/body-weights', { method: 'POST', body: JSON.stringify(entry) }),
  updateBodyWeight: (id, entry) => request(`/body-weights/${id}`, { method: 'PUT', body: JSON.stringify(entry) }),
  deleteBodyWeight: (id) => request(`/body-weights/${id}`, { method: 'DELETE' }),

  exportBackup: () => request('/backup/export'),
  importBackup: (payload) => request('/backup/import', { method: 'POST', body: JSON.stringify(payload) }),
};
