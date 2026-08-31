import { Router } from 'express';
import { readState, updateState } from '../lib/store.js';

const router = Router();

router.get('/', async (req, res) => {
  const state = await readState();
  res.json(state.exercises);
});

router.post('/', async (req, res) => {
  const { muscleGroup, name } = req.body;
  if (!muscleGroup || !name || !String(name).trim()) {
    return res.status(400).json({ error: 'muscleGroup and name are required' });
  }
  const trimmedName = String(name).trim();
  const next = await updateState((state) => {
    if (!state.exercises[muscleGroup]) state.exercises[muscleGroup] = [];
    if (!state.exercises[muscleGroup].includes(trimmedName)) {
      state.exercises[muscleGroup].push(trimmedName);
    }
    return state;
  });
  res.status(201).json(next.exercises);
});

router.delete('/:muscleGroup/:name', async (req, res) => {
  const { muscleGroup, name } = req.params;
  const decodedName = decodeURIComponent(name);
  const next = await updateState((state) => {
    if (state.exercises[muscleGroup]) {
      state.exercises[muscleGroup] = state.exercises[muscleGroup].filter((n) => n !== decodedName);
    }
    return state;
  });
  res.json(next.exercises);
});

export default router;
