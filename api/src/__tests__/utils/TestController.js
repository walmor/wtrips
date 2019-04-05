import express from 'express';
import testDbManager from './test-db';

const router = express.Router();

router.post('/seed-db', async (req, res) => {
  await testDbManager.init();
  await testDbManager.seedDatabase();
  res.sendStatus(204);
});

export default router;
