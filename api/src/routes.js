import express from 'express';
import AuthController from './auth/AuthController';
import UserController from './users/UserController';

const router = express.Router();

router.use('/auth', AuthController);
router.use('/users', UserController);

export default router;
