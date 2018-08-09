import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import User from './User';

beforeAll(async () => {
  await mongodbInMemory.init();
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
});

function createUser(props) {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    password: '123456',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastIPAddress: '189.100.242.238',
  };

  return new User(Object.assign(user, props));
}

async function testRequiredProperty(propName) {
  expect.assertions(2);

  const user = createUser({ [propName]: null });

  try {
    await user.save();
  } catch (error) {
    expect(error.errors[propName]).toBeDefined();
    expect(error.errors[propName].kind).toBe('required');
  }
}

describe('The user', async () => {
  it('should not be saved without a name', async () => {
    await testRequiredProperty('name');
  });

  it('should not be saved without an email', async () => {
    await testRequiredProperty('email');
  });

  it('should not be saved with an invalid email', async () => {
    expect.assertions(2);

    const user = createUser({ email: 'invalid-email' });

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

    const user1 = createUser({ email });
    const user2 = createUser({ email });

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
    await testRequiredProperty('password');
  });

  it('should not be saved without a creation date', async () => {
    await testRequiredProperty('createdAt');
  });

  it('should not be saved without an update date', async () => {
    await testRequiredProperty('updatedAt');
  });

  it('should not be saved without an IP address', async () => {
    await testRequiredProperty('lastIPAddress');
  });

  it('should not be saved with an invalid IP address', async () => {
    expect.assertions(2);

    const user = createUser({ lastIPAddress: 'invalid-ip-address' });

    try {
      await user.save();
    } catch (error) {
      expect(error.errors.lastIPAddress).toBeDefined();
      expect(error.errors.lastIPAddress.kind).toBe('user defined');
    }
  });

  it('should not have its creation date updated', async () => {
    const user = createUser();
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
    const user = createUser({ password });
    const savedUser = await user.save();

    expect(savedUser.password).not.toBeFalsy();
    expect(savedUser.password).not.toEqual(password);
  });

  it('should be saved when is valid', async () => {
    const user = createUser();
    const savedUser = await user.save();
    expect(savedUser.id).toBeTruthy();
  });

  it('should be able to compare passwords', async () => {
    const password = '123456';
    const user = createUser({ password });
    const savedUser = await user.save();

    expect(await savedUser.comparePassword(password)).toBe(true);
    expect(await savedUser.comparePassword('any-other-pwd')).toBe(false);
  });
});
