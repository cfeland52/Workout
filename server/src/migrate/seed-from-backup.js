import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DATA_FILE, writeState } from '../lib/store.js';
import { mergeStates } from '../lib/merge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_FILE = path.join(__dirname, '..', '..', '..', 'docs', 'legacy', 'workout-book-backup-2026-08-24.json');

async function main() {
  const raw = await fs.readFile(BACKUP_FILE, 'utf8');
  const payload = JSON.parse(raw);
  const incoming = payload.state || payload;

  let finalState;
  let added, updated;
  try {
    const existingRaw = await fs.readFile(DATA_FILE, 'utf8');
    const existing = JSON.parse(existingRaw);
    const result = mergeStates(existing, incoming);
    finalState = result.state;
    added = result.added;
    updated = result.updated;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    finalState = incoming;
    added = incoming.users.length + incoming.workouts.length + incoming.events.length + incoming.bodyWeights.length;
    updated = 0;
  }

  await writeState(finalState);

  console.log('Seeded server/data/data.json from backup:');
  console.log(`  users:       ${finalState.users.length}`);
  console.log(`  workouts:    ${finalState.workouts.length}`);
  console.log(`  events:      ${finalState.events.length}`);
  console.log(`  bodyWeights: ${finalState.bodyWeights.length}`);
  console.log(`  exercises:   ${Object.values(finalState.exercises).reduce((n, arr) => n + arr.length, 0)} names across ${Object.keys(finalState.exercises).length} groups`);
  console.log(`  (merge: ${added} added, ${updated} updated)`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
