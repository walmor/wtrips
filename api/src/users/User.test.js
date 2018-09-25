import testDbManager from '../__tests__/utils/test-db';
import { createUser, updateUser, testRequiredProperty } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await testDbManager.init();
});

afterAll(async () => {
  await testDbManager.stop();
});

afterEach(async () => {
  await testDbManager.clearDatabase();
});

const testUserRequiredProperty = testRequiredProperty(createUser);

describe('The user', async () => {
  it('should not be saved without a name', async () => {
    await testUserRequiredProperty('name');
  });

  it('should not be saved without an email', async () => {
    await testUserRequiredProperty('email');
  });

  it('should not be saved if the email already exists', async () => {
    expect.assertions(2);
    const email = 'test@example.com';

    await createUser({ email });

    try {
      await createUser({ email });
    } catch (error) {
      const duplicateKeyErrorCode = '23505';
      expect(error.code).toBe(duplicateKeyErrorCode);
      expect(error.detail).toContain(email);
    }
  });

  it('should not be saved without a password', async () => {
    await testUserRequiredProperty('password');
  });

  it('should not be saved without an IP address', async () => {
    await testUserRequiredProperty('lastIpAddress');
  });

  it('should be saved with a creation and update date', async () => {
    const user = await createUser();

    expect(user.createdAt).toBeTruthy();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toEqual(user.createdAt);
  });

  it('should have its update date updated', async () => {
    const user = await createUser();
    const { updatedAt } = user;
    await updateUser(user);

    expect(user.updatedAt).not.toEqual(updatedAt);
  });

  it('should not have its creation date updated', async () => {
    const user = await createUser();
    const { createdAt } = user;

    const testDate = new Date();
    testDate.setMonth((testDate.getMonth() + 1) % 12);

    user.createdAt = testDate;
    const updatedUser = await updateUser(user);

    expect(updatedUser.createdAt).toEqual(createdAt);
  });

  it('should be saved with encrypted password', async () => {
    const password = '123456';
    const user = await createUser({ password });

    expect(user.password).not.toBeFalsy();
    expect(user.password).not.toEqual(password);
  });

  it('should be saved when is valid', async () => {
    const user = await createUser();
    expect(user.id).toBeTruthy();
  });

  it('should be able to compare passwords', async () => {
    const password = '123456';
    const user = await createUser({ password });

    expect(await user.comparePassword(password)).toBe(true);
    expect(await user.comparePassword('any-other-pwd')).toBe(false);
  });
});
