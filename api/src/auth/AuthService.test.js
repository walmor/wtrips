import { Unauthorized, BadRequest } from 'http-errors';
import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import { createUser } from '../__tests__/utils/helpers';
import User from '../users/User';
import AuthService from './AuthService';

beforeAll(async () => {
  await mongodbInMemory.init();
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
});

function getUserData() {
  return {
    name: 'Peter',
    email: 'peter@example.com',
    password: 'password',
    lastIPAddress: '189.100.242.238',
  };
}

describe('The AuthService', () => {
  const service = new AuthService();

  describe('when the user is signing up', () => {
    it('should throw BadRequest if the user data is invalid', async () => {
      const signup = service.signup({ name: null, email: null });

      await expect(signup).rejects.toThrow(BadRequest);
    });

    it('should create a new user if the user data is valid', async () => {
      const userData = getUserData();
      const { user } = await service.signup(userData);

      expect(user._id).toBeTruthy();
      expect(user.name).toEqual(userData.name);
      expect(user.email).toEqual(userData.email);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt).toEqual(user.updatedAt);
    });

    it('should return a token when signing up successfully', async () => {
      const userData = getUserData();
      const { token } = await service.signup(userData);

      expect(token).toBeTruthy();
      expect(typeof token).toEqual('string');
    });
  });

  describe('when the user is signing in', () => {
    it('should throw BadRequest if the email is not passed', async () => {
      const signin = service.signin(null, 'pwd', '1.1.1.1');
      await expect(signin).rejects.toThrow(BadRequest);
    });

    it('should throw BadRequest if the password is not passed', async () => {
      const signin = service.signin('test@example.com', null, '1.1.1.1');
      await expect(signin).rejects.toThrow(BadRequest);
    });

    it('should throw BadRequest if the IP address is not passed', async () => {
      const signin = service.signin('test@example.com', 'pwd', null);
      await expect(signin).rejects.toThrow(BadRequest);
    });

    it('should throw Unauthorized if the email does not exist', async () => {
      const signin = service.signin('test@example.com', 'pwd', '1.1.1.1');
      await expect(signin).rejects.toThrow(Unauthorized);
    });

    it('should throw Unauthorized if the password is valid', async () => {
      const password = '1234';
      const user = await createUser({ password });
      await user.save();

      const signin = service.signin(user.email, 'different-pwd', '1.1.1.1');
      await expect(signin).rejects.toThrow(Unauthorized);
    });

    it('should set the last IP address when signing in successfully', async () => {
      const password = '1234';
      const ip = '1.1.1.1';
      const user = await createUser({ password });
      await user.save();

      await service.signin(user.email, password, ip);

      const savedUser = await User.findById(user.id);

      expect(savedUser.lastIPAddress).toEqual(ip);
    });

    it('should return a token when signing in successfully', async () => {
      const password = '1234';
      const user = await createUser({ password });
      await user.save();

      const { token } = await service.signin(user.email, password, '1.1.1.1');

      expect(token).toBeTruthy();
      expect(typeof token).toEqual('string');
    });
  });
});
