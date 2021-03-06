import { Forbidden, NotFound, BadRequest } from 'http-errors';
import testDbManager from '../__tests__/utils/test-db';
import * as acl from '../auth/Acl';
import { createUser, createUsers } from '../__tests__/utils/helpers';
import UserService from './UserService';

beforeAll(async () => {
  await testDbManager.init();
  acl.default = jest.fn(() => true);
});

afterAll(async () => {
  await testDbManager.stop();
});

beforeEach(async () => {
  await testDbManager.clearDatabase();
  acl.default.mockClear();
});

async function getServiceWithCurrUsr(userProps) {
  const currUser = await createUser(userProps);

  const service = new UserService(currUser);

  return { currUser, service };
}

describe('The UserService', () => {
  describe('when getting an user by id', () => {
    it('should get an existing user', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const foundUser = await service.get(currUser.id);

      expect(foundUser.id).toEqual(currUser.id);
    });

    it('should throw NotFound if the user doesnt exist', async () => {
      const { service } = await getServiceWithCurrUsr();

      const get = service.get('any-invalid-id');

      await expect(get).rejects.toThrowError(NotFound);
    });

    it('should ensure the user is authorized', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      await service.get(currUser.id);

      expect(acl.default).toHaveBeenCalled();
    });
  });

  describe('when updating an user', () => {
    it('should throw NotFound if the user doesnt exist', async () => {
      const { service } = await getServiceWithCurrUsr();

      const get = service.update('any-invalid-id');

      await expect(get).rejects.toThrowError(NotFound);
    });

    it('should ensure the user is authorized ', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();
      const userData = { name: 'John', email: 'john@example.com' };

      await service.update(currUser.id, userData);

      expect(acl.default).toHaveBeenCalled();
    });

    it('should not allow an user to change his own role', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const userData = {
        name: currUser.name,
        email: currUser.email,
        role: 'admin',
      };

      const udpate = service.update(currUser.id, userData);

      await expect(udpate).rejects.toThrowError(Forbidden);
    });

    it('should not allow an user to change his own state', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const userData = {
        name: currUser.name,
        email: currUser.email,
        isActive: false,
      };

      const udpate = service.update(currUser.id, userData);

      await expect(udpate).rejects.toThrowError(Forbidden);
    });

    it('should not allow change the email if it already exists', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();
      const user2 = await createUser({ email: 'user2@example.com' });

      const udpate = service.update(currUser.id, { email: user2.email });

      await expect(udpate).rejects.toThrowError(BadRequest);
    });

    it('should throw BadRequest if the user data is invalid', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      expect.assertions(2);

      try {
        await service.update(currUser.id, { email: 'invalid-email' });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.errors).toBeDefined();
      }
    });

    it('should update an existing user with valid data', async () => {
      const name = 'Peter';
      const email = 'peter@example.com';

      const { currUser, service } = await getServiceWithCurrUsr();

      const updatedUser = await service.update(currUser.id, { name, email });

      expect(updatedUser.name).toEqual(name);
      expect(updatedUser.email).toEqual(email);
    });

    it('should not allow a manager to change the user role to admin', async () => {
      const { service } = await getServiceWithCurrUsr({ role: 'manager' });
      const usr = await createUser({ role: 'user' });

      const userData = {
        name: usr.name,
        email: usr.email,
        role: 'admin',
      };

      const udpate = service.update(usr.id, userData);

      await expect(udpate).rejects.toThrowError(Forbidden);
    });
  });

  describe('when listing users', () => {
    it('should ensure the user is authorized', async () => {
      const { service } = await getServiceWithCurrUsr();

      await service.list();

      expect(acl.default).toHaveBeenCalled();
    });

    it('should return the first 20 users if no options are passed', async () => {
      const qty = 32;
      await createUsers(qty);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list();

      expect(result.totalCount).toBe(qty + 1);
      expect(result.users.length).toBe(20);
    });

    it('should throw BadRequest if options are invalid', async () => {
      const { service } = await getServiceWithCurrUsr();

      let list = service.list({ page: 'NaN' });
      await expect(list).rejects.toThrow();

      list = service.list({ pageSize: -1 });
      await expect(list).rejects.toThrow();
    });

    it('should return the number of users acordingly the page size', async () => {
      const pageSize = 10;
      await createUsers(12);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ pageSize });

      expect(result.users.length).toBe(pageSize);
    });

    it('should handle pagination', async () => {
      const qty = 16;
      const pageSize = 10;
      const page = 2;
      const secPageQty = 7;

      await createUsers(qty);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ page, pageSize });

      expect(result.users.length).toBe(secPageQty);
    });

    it('should search by name', async () => {
      const name = 'Peter McClain UnitTest';
      const email = 'peter-mcclain@example.com';

      await createUser({ name, email });

      await createUsers(10);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ search: name });

      expect(result.users.length).toBe(1);
    });

    it('should search by email', async () => {
      const name = 'Peter McClain UnitTest';
      const email = 'peter-mcclain-unittest@example.com';

      await createUser({ name, email });

      await createUsers(10);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ search: email });

      expect(result.users.length).toBe(1);
    });

    it('shoult not return admin users when the current user is manager', async () => {
      const { service } = await getServiceWithCurrUsr({ role: 'manager' });

      await createUser({ role: 'admin' });

      await createUser({ role: 'user' });

      const result = await service.list();

      expect(result.users.length).toBe(2);
      expect(result.users[0].role).not.toEqual('admin');
      expect(result.users[1].role).not.toEqual('admin');
    });
  });
});
