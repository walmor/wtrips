import express from 'express';

const router = express.Router();

router.post('/signin', async (req, res) => {
  res.json(await req.authService.signin(req.body.email, req.body.password, req.ip));
});

router.post('/signup', async (req, res) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    lastIPAddress: req.ip,
  };

  res.json(await req.authService.signup(userData));
});

export default router;
