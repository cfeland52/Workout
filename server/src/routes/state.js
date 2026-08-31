import { Router } from 'express';
import { readState } from '../lib/store.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await readState());
});

export default router;
