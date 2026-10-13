import { Router } from 'express';
import { getStores } from '../lib/db.js';

const router = Router();

router.get('/stores', (req, res) => {
  res.json({ stores: getStores() });
});

export default router;
