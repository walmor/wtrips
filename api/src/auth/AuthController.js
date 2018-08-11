import express from 'express';
import AuthService from './AuthService';
import User from '../users/User';

const router = express.Router();
const service = new AuthService();

router.post('/signin', async (req, res) => {
  const result = await service.signin(req.body.email, req.body.password, req.ip);
  res.json(result);
});

router.post('/signup', async (req, res) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    lastIPAddress: req.ip,
  };

  const result = await service.signup(userData);
  res.json(result);
});

async function setCurrentUser(req, res, next) {
  if (req.auth && req.auth.user) {
    const userId = req.auth.user.id;
    req.user = await User.findById(userId);
  }

  next();
}

export { router as default, setCurrentUser };
