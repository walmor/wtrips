import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import { createUser, testRequiredProperty } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await mongodbInMemory.init();
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
});

const testUserRequiredProperty = testRequiredProperty(createUser);

describe('The user', async () => {
  it('should not be saved without a name', async () => {
    await testUserRequiredProperty('name');
  });

  it('should not be saved without an email', async () => {
    await testUserRequiredProperty('email');
  });

  it('should not be saved with an invalid email', async () => {
    expect.assertions(2);

    const user = await createUser({ email: 'invalid-email' });

    try {
      await user.save();
    } catch (error) {
      expect(error.errors.email).toBeDefined();
      expect(error.errors.email.kind).toBe('user defined');
    }
  });

  it('should not be saved if the email already exists', async () => {
    expect.assertions(2);
    const email = 'test@example.com';

    const user1 = await createUser({ email });
    const user2 = await createUser({ email });

    await user1.save();

    try {
      await user2.save();
    } catch (error) {
      const duplicateKeyErrorCode = 11000;
      expect(error.code).toBe(duplicateKeyErrorCode);
      expect(error.message).toContain(email);
    }
  });

  it('should not be saved without a password', async () => {
    await testUserRequiredProperty('password');
  });

  it('should not be saved without a creation date', async () => {
    await testUserRequiredProperty('createdAt');
  });

  it('should not be saved without an update date', async () => {
    await testUserRequiredProperty('updatedAt');
  });

  it('should not be saved without an IP address', async () => {
    await testUserRequiredProperty('lastIPAddress');
  });

  it('should not be saved with an invalid IP address', async () => {
    expect.assertions(2);

    const user = await createUser({ lastIPAddress: 'invalid-ip-address' });

    try {
      await user.save();
    } catch (error) {
      expect(error.errors.lastIPAddress).toBeDefined();
      expect(error.errors.lastIPAddress.kind).toBe('user defined');
    }
  });

  it('should not have its creation date updated', async () => {
    const user = await createUser();
    const savedUser = await user.save();
    const { createdAt } = savedUser;

    const testDate = new Date();
    testDate.setMonth((testDate.getMonth() + 1) % 12);

    savedUser.createdAt = testDate;
    await savedUser.save();

    expect(savedUser.createdAt).toEqual(createdAt);
  });

  it('should be saved with encrypted password', async () => {
    const password = '123456';
    const user = await createUser({ password });
    const savedUser = await user.save();

    expect(savedUser.password).not.toBeFalsy();
    expect(savedUser.password).not.toEqual(password);
  });

  it('should be saved when is valid', async () => {
    const user = await createUser();
    await user.save();
    expect(user.id).toBeTruthy();
  });

  it('should be able to compare passwords', async () => {
    const password = '123456';
    const user = await createUser({ password });
    const savedUser = await user.save();

    expect(await savedUser.comparePassword(password)).toBe(true);
    expect(await savedUser.comparePassword('any-other-pwd')).toBe(false);
  });
});
