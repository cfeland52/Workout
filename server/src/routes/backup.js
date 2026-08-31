import { Router } from 'express';
import { readState, updateState } from '../lib/store.js';
import { mergeStates } from '../lib/merge.js';

const router = Router();

function nowStamp() {
  const d = new Date();
  const pad2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

router.get('/export', async (req, res) => {
  const state = await readState();
  res.json({ app: 'workout-book', exportedAt: nowStamp(), state });
});

router.post('/import', async (req, res) => {
  const body = req.body;
  const incoming = body && body.state && body.app === 'workout-book' ? body.state : body;
  if (!incoming || !Array.isArray(incoming.users) || !Array.isArray(incoming.workouts)) {
    return res.status(400).json({ error: "That doesn't look like a valid Workout Book backup." });
  }
  let result;
  await updateState((current) => {
    result = mergeStates(current, incoming);
    return result.state;
  });
  res.json({ added: result.added, updated: result.updated });
});

export default router;
