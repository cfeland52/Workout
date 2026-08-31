import { Router } from 'express';
import { readState, updateState } from '../lib/store.js';
import { uid } from '../lib/ids.js';

// Shared GET-list/POST/PUT/DELETE routes for the three simple by-userId
// collections (workouts, events, bodyWeights) — they all follow the same
// id-keyed CRUD shape against the single state.json store.
export function collectionRouter(collectionKey, idPrefix) {
  const router = Router();

  router.get('/', async (req, res) => {
    const state = await readState();
    const { userId } = req.query;
    const list = state[collectionKey];
    res.json(userId ? list.filter((x) => x.userId === userId) : list);
  });

  router.post('/', async (req, res) => {
    const record = { ...req.body, id: uid(idPrefix) };
    await updateState((state) => {
      state[collectionKey].push(record);
      return state;
    });
    res.status(201).json(record);
  });

  // Upsert: the client always knows the record's id upfront (generated
  // client-side, see client/src/lib/id.js) so a create and an update are the
  // same request — and replaying one after an offline retry is a safe no-op
  // rather than a 404 or a duplicate.
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    let saved = null;
    await updateState((state) => {
      const idx = state[collectionKey].findIndex((x) => x.id === id);
      saved = { ...req.body, id };
      if (idx === -1) state[collectionKey].push(saved);
      else state[collectionKey][idx] = saved;
      return state;
    });
    res.json(saved);
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await updateState((state) => {
      state[collectionKey] = state[collectionKey].filter((x) => x.id !== id);
      return state;
    });
    res.status(204).end();
  });

  return router;
}
