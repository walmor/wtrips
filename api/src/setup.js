import AuthService from './auth/AuthService';
import UserService from './users/UserService';
import TripService from './trips/TripService';
import userRepository from './users/UserRepository';

async function setCurrentUser(req) {
  if (req.auth && req.auth.user) {
    const userId = req.auth.user.id;
    req.user = await userRepository.findById(userId);
  }
}

async function setServices(req) {
  req.authService = new AuthService(req.user);
  req.userService = new UserService(req.user);
  req.tripService = new TripService(req.user);
}

async function setupRequest(req, res, next) {
  await setCurrentUser(req);
  await setServices(req);
  next();
}

export default setupRequest;
