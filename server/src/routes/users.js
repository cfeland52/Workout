import { Router } from 'express';
import { readState, updateState } from '../lib/store.js';
import { uid } from '../lib/ids.js';

const router = Router();

router.get('/', async (req, res) => {
  const state = await readState();
  res.json(state.users);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const user = { id: uid('user'), name: String(name).trim() };
  await updateState((state) => {
    state.users.push(user);
    return state;
  });
  res.status(201).json(user);
});

export default router;
