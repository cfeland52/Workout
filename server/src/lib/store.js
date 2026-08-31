import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const TMP_FILE = path.join(DATA_DIR, 'data.json.tmp');

const EMPTY_STATE = {
  users: [],
  exercises: {},
  workouts: [],
  events: [],
  bodyWeights: [],
  currentSchemaVersion: 1,
};

// Serializes writes so two rapid mutation requests (e.g. phone + desktop
// at once) never interleave two read-modify-write cycles against the file.
let writeChain = Promise.resolve();

export async function readState() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeState(EMPTY_STATE);
      return structuredClone(EMPTY_STATE);
    }
    throw err;
  }
}

export function writeState(state) {
  writeChain = writeChain.then(() => writeStateNow(state));
  return writeChain;
}

async function writeStateNow(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TMP_FILE, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(TMP_FILE, DATA_FILE);
}

// Runs a read-modify-write against the store as one atomic step relative to
// other calls made through this function (chained on the same write lock).
export function updateState(mutator) {
  const step = writeChain.then(async () => {
    let current;
    try {
      current = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      current = structuredClone(EMPTY_STATE);
    }
    const next = await mutator(current);
    await writeStateNow(next);
    return next;
  });
  writeChain = step.catch(() => {});
  return step;
}

export { EMPTY_STATE, DATA_FILE };
