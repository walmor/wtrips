import { Unauthorized, BadRequest, InternalServerError } from 'http-errors';
import testDbManager from '../__tests__/utils/test-db';
import { createUser } from '../__tests__/utils/helpers';
import AuthService from './AuthService';
import userRepository from '../users/UserRepository';

beforeAll(async () => {
  await testDbManager.init();
});

afterAll(async () => {
  await testDbManager.stop();
});

beforeEach(async () => {
  await testDbManager.clearDatabase();
});

function getUserData() {
  return {
    name: 'Peter',
    email: 'peter@example.com',
    password: 'password',
    lastIpAddress: '189.100.242.238',
  };
}

describe('The AuthService', () => {
  const service = new AuthService();

  describe('when the user is signing up', () => {
    it('should throw BadRequest if the user data is invalid', async () => {
      const signup = service.signup({ name: null, email: null }, '1.1.1.1');

      await expect(signup).rejects.toThrow(BadRequest);
    });

    it('should throw InternalServerError if the IP address is invalid', async () => {
      const userData = getUserData();
      const signup = service.signup(userData, null);

      await expect(signup).rejects.toThrow(InternalServerError);
    });

    it('should return a token when signing up successfully', async () => {
      const userData = getUserData();
      const { token } = await service.signup(userData, '1.1.1.1');

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

    it('should throw InternalServerError if the IP address is not passed', async () => {
      const signin = service.signin('test@example.com', 'pwd', null);
      await expect(signin).rejects.toThrow(InternalServerError);
    });

    it('should throw Unauthorized if the email does not exist', async () => {
      const signin = service.signin('test@example.com', 'pwd', '1.1.1.1');
      await expect(signin).rejects.toThrow(Unauthorized);
    });

    it('should throw Unauthorized if the password is valid', async () => {
      const password = '1234';
      const user = await createUser({ password });

      const signin = service.signin(user.email, 'different-pwd', '1.1.1.1');
      await expect(signin).rejects.toThrow(Unauthorized);
    });

    it('should throw Unauthorized if the user is inactive', async () => {
      const password = '1234';
      const user = await createUser({ password, isActive: false });

      const signin = service.signin(user.email, password, '1.1.1.1');
      await expect(signin).rejects.toThrow(Unauthorized);
    });

    it('should set the last IP address when signing in successfully', async () => {
      const password = '1234';
      const ip = '1.1.1.1';
      const user = await createUser({ password });

      await service.signin(user.email, password, ip);

      const savedUser = await userRepository.findById(user.id);

      expect(savedUser.lastIpAddress).toEqual(ip);
    });

    it('should return a token when signing in successfully', async () => {
      const password = '1234';
      const user = await createUser({ password });

      const { token } = await service.signin(user.email, password, '1.1.1.1');

      expect(token).toBeTruthy();
      expect(typeof token).toEqual('string');
    });
  });
});
