import User from './users/User';
import AuthService from './auth/AuthService';
import UserService from './users/UserService';
import TripService from './trips/TripService';

async function setCurrentUser(req) {
  if (req.auth && req.auth.user) {
    const userId = req.auth.user.id;
    req.user = await User.findById(userId);
  }
}

async function setServices(req) {
  req.authService = new AuthService();
  req.userService = new UserService(req.user);
  req.tripService = new TripService(req.user);
}

async function setupRequest(req, res, next) {
  await setCurrentUser(req);
  await setServices(req);
  next();
}

export default setupRequest;
