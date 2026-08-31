import { Router } from 'express';
import { readState, updateState } from '../lib/store.js';

const router = Router();

router.get('/', async (req, res) => {
  const state = await readState();
  res.json(state.users);
});

// Upsert, same rationale as collectionRouter.js: the client generates the id
// upfront so offline-created users can be safely retried.
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const user = { id, name: String(name).trim() };
  await updateState((state) => {
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) state.users.push(user);
    else state.users[idx] = user;
    return state;
  });
  res.json(user);
});

export default router;
