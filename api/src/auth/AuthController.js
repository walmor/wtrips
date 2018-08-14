import express from 'express';

const router = express.Router();

router.post('/signin', async (req, res) => {
  res.json(await req.authService.signin(req.body.email, req.body.password, req.ip));
});

router.post('/signup', async (req, res) => {
  res.json(await req.authService.signup(req.body, req.ip));
});

router.get('/email-available', async (req, res) => {
  res.json(await req.authService.isEmailAvailable(req.query.email));
});

export default router;
