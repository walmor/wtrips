import jwt from 'jsonwebtoken';
import { Unauthorized, BadRequest, InternalServerError } from 'http-errors';
import User from '../users/User';
import config from '../config';
import validateAndSanitizeUserData from '../users/UserSchema';

function createAuthReturn(usr) {
  const user = usr.toObject();
  const token = jwt.sign(
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return { token };
}

class AuthService {
  async signup(userData, ipAddress) {
    if (!ipAddress) {
      throw new InternalServerError('The IP address is required.');
    }

    const data = await validateAndSanitizeUserData('create', userData);

    const user = new User(data);
    user.lastIPAddress = ipAddress;

    await user.save();
    return createAuthReturn(user);
  }

  async signin(email, password, ipAddress) {
    if (!email) {
      throw new BadRequest('The email is required.');
    }

    if (!password) {
      throw new BadRequest('The password is required.');
    }

    if (!ipAddress) {
      throw new InternalServerError('The IP address is required.');
    }

    const user = await User.findOne({ email });

    const unauthorized = new Unauthorized('Invalid email or password.');

    if (!user || !user.isActive) {
      throw unauthorized;
    }

    const validPwd = await user.comparePassword(password);

    if (!validPwd) {
      throw unauthorized;
    }

    user.lastIPAddress = ipAddress;
    await user.save();

    return createAuthReturn(user);
  }

  async isEmailAvailable(email) {
    if (!email) {
      throw new BadRequest('The email is required.');
    }

    const user = await User.findOne({ email });

    return { email, isAvailable: user === null };
  }
}

export default AuthService;
