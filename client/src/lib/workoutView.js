// Ported from Workout-Book.html's day-detail view helpers (docs/legacy/Workout-Book.html:911-946).
export function setLabel(set) {
  if (set.isDrop) {
    return `${set.stages.map((s) => s.reps).join(' → ')} reps @ ${set.stages.map((s) => s.weight).join('/')}`;
  }
  return `${set.reps} reps @ ${set.weight}`;
}

export function cardioLabel(c) {
  if (c.machine === 'Treadmill') {
    return [c.time, c.speed, c.incline ? `${c.incline}° incline` : ''].filter(Boolean).join(' · ');
  }
  if (c.machine === 'Bike') {
    return [c.time, c.speed].filter(Boolean).join(' · ');
  }
  if (c.machine === 'Row Machine') {
    if (c.intervals && c.intervals.length) {
      return c.intervals.map((iv) => `${iv.distance} in ${iv.split}`).join(', ');
    }
    return [c.totalDistance, c.time, c.avgSplit ? `avg split ${c.avgSplit}` : ''].filter(Boolean).join(' · ');
  }
  return c.description || c.notes || '';
}
