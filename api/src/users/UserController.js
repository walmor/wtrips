import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await req.userService.list(req.query));
});

router.get('/:id', async (req, res) => {
  res.json(await req.userService.get(req.params.id));
});

router.put('/:id', async (req, res) => {
  res.json(await req.userService.update(req.params.id, req.body));
});

export default router;
