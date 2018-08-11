import express from 'express';
import AuthController from './auth/AuthController';
import UserController from './users/UserController';
import TripController from './trips/TripController';

const router = express.Router();

router.use('/auth', AuthController);
router.use('/users', UserController);
router.use('/trips', TripController);

export default router;
