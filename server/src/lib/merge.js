// Ported from Workout-Book.html's mergeBysId/mergeStates (docs/legacy/Workout-Book.html:571-598).
function mergeBysId(existingArr, incomingArr) {
  const byId = {};
  (existingArr || []).forEach((x) => { byId[x.id] = x; });
  let added = 0, updated = 0;
  (incomingArr || []).forEach((x) => {
    if (!x || !x.id) return;
    if (byId[x.id]) updated++; else added++;
    byId[x.id] = x;
  });
  return { list: Object.values(byId), added, updated };
}

export function mergeStates(current, incoming) {
  const counts = { added: 0, updated: 0 };

  const users = mergeBysId(current.users, incoming.users);
  counts.added += users.added; counts.updated += users.updated;

  const workouts = mergeBysId(current.workouts, incoming.workouts);
  counts.added += workouts.added; counts.updated += workouts.updated;

  const events = mergeBysId(current.events, incoming.events);
  counts.added += events.added; counts.updated += events.updated;

  const bodyWeights = mergeBysId(current.bodyWeights, incoming.bodyWeights);
  counts.added += bodyWeights.added; counts.updated += bodyWeights.updated;

  const exercises = structuredClone(current.exercises || {});
  Object.keys(incoming.exercises || {}).forEach((group) => {
    if (!exercises[group]) exercises[group] = [];
    (incoming.exercises[group] || []).forEach((name) => {
      if (!exercises[group].includes(name)) exercises[group].push(name);
    });
  });

  return {
    state: {
      users: users.list,
      exercises,
      workouts: workouts.list,
      events: events.list,
      bodyWeights: bodyWeights.list,
      currentSchemaVersion: Math.max(
        current.currentSchemaVersion || 1,
        incoming.currentSchemaVersion || 1
      ),
    },
    added: counts.added,
    updated: counts.updated,
  };
}
