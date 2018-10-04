import express from 'express';
import AuthController from './auth/AuthController';
import UserController from './users/UserController';
import TripController from './trips/TripController';
import TestController from './__tests__/utils/TestController';

const router = express.Router();

router.use('/auth', AuthController);
router.use('/users', UserController);
router.use('/trips', TripController);

if (process.env.NODE_ENV === 'test') {
  router.use('/tests', TestController);
}

export default router;
