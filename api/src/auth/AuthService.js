import jwt from 'jsonwebtoken';
import { Unauthorized, BadRequest } from 'http-errors';
import formatMongooseError from 'mongoose-error-beautifier';
import User from '../users/User';
import config from '../config';

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
  async signup(userData) {
    const user = new User(userData);

    user.role = 'user';
    user.createdAt = new Date();
    user.updatedAt = user.createdAt;

    try {
      await user.save();
      return createAuthReturn(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        const badRequest = new BadRequest('User validation failed.');
        badRequest.errors = formatMongooseError(err);
        throw badRequest;
      }

      throw err;
    }
  }

  async signin(email, password, ipAddress) {
    if (!email) {
      throw new BadRequest('The email is required.');
    }

    if (!password) {
      throw new BadRequest('The password is required.');
    }

    if (!ipAddress) {
      throw new BadRequest('The IP address is required.');
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
}

export default AuthService;
