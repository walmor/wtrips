import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await req.tripService.list(req.query));
});

router.get('/travelplan', async (req, res) => {
  res.json(await req.tripService.getTravelPlan(req.query));
});

router.get('/:id', async (req, res) => {
  res.json(await req.tripService.get(req.params.id));
});

router.delete('/:id', async (req, res) => {
  res.json(await req.tripService.delete(req.params.id));
});

router.post('/', async (req, res) => {
  res.status(201).json(await req.tripService.create(req.body));
});

router.put('/:id', async (req, res) => {
  res.json(await req.tripService.update(req.params.id, req.body));
});

export default router;
