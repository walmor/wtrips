import jwt from 'jsonwebtoken';
import { Unauthorized, BadRequest, InternalServerError } from 'http-errors';
import config from '../config';
import validateAndSanitizeUserData from '../users/UserSchema';
import userRepository from '../users/UserRepository';

function createAuthReturn(usr) {
  const user = usr.toObject();
  const token = jwt.sign(
    {
      user: {
        id: user.id,
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
  constructor(currUser) {
    this.currUser = currUser;
  }

  async signup(userData, ipAddress) {
    if (!ipAddress) {
      throw new InternalServerError('The IP address is required.');
    }

    const data = await validateAndSanitizeUserData('create', userData);
    data.lastIpAddress = ipAddress;

    const user = await userRepository.insert(data);

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

    const user = await userRepository.findByEmail(email);

    const unauthorized = new Unauthorized('Invalid email or password.');

    if (!user || !user.isActive) {
      throw unauthorized;
    }

    const validPwd = await user.comparePassword(password);

    if (!validPwd) {
      throw unauthorized;
    }

    user.lastIpAddress = ipAddress;
    await userRepository.update(user.id, user);

    return createAuthReturn(user);
  }

  async isEmailAvailable(email) {
    if (!email) {
      throw new BadRequest('The email is required.');
    }

    const isAvailable = await userRepository.isEmailAvailable(email);

    return { email, isAvailable };
  }

  async renewToken() {
    return createAuthReturn(this.currUser);
  }
}

export default AuthService;
