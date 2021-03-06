import { Forbidden, Unauthorized } from 'http-errors';
import testDbManager from '../__tests__/utils/test-db';
import ensureAuthorized from './Acl';
import { createUser, createTrip } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await testDbManager.init();
});

afterAll(async () => {
  await testDbManager.stop();
});

beforeEach(async () => {
  await testDbManager.clearDatabase();
});

const admin = async () => createUser({ role: 'admin' });
const manager = async () => createUser({ role: 'manager' });
const user = async () => createUser({ role: 'user' });

describe('The admin user', async () => {
  it('should have access to list users', async () => {
    const adm = await admin();
    await expect(ensureAuthorized(adm, 'user', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit users', async () => {
    const adm = await admin();
    await expect(ensureAuthorized(adm, 'user', 'edit')).resolves.not.toThrow();
  });

  it('should have access to update users', async () => {
    const adm = await admin();
    await expect(ensureAuthorized(adm, 'user', 'update')).resolves.not.toThrow();
  });

  it('should have access to list trips', async () => {
    const adm = await admin();
    await expect(ensureAuthorized(adm, 'trip', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit trips', async () => {
    const adm = await admin();
    const trip = await createTrip();
    await expect(ensureAuthorized(adm, trip, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update trips', async () => {
    const adm = await admin();
    const trip = await createTrip();
    await expect(ensureAuthorized(adm, trip, 'update')).resolves.not.toThrow();
  });
});

describe('The manager user', async () => {
  it('should have access to list users', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'user', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit regular users', async () => {
    const mng = await manager();
    const usr = await user();
    await expect(ensureAuthorized(mng, usr, 'edit')).resolves.not.toThrow();
  });

  it('should have access to edit manager users', async () => {
    const mng = await manager();
    const mng2 = await manager();
    await expect(ensureAuthorized(mng, mng2, 'edit')).resolves.not.toThrow();
  });

  it('should not have access to edit admin users', async () => {
    const mng = await manager();
    const adm = await admin();
    await expect(ensureAuthorized(mng, adm, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should have access to update regular users', async () => {
    const mng = await manager();
    const usr = await user();
    await expect(ensureAuthorized(mng, usr, 'update')).resolves.not.toThrow();
  });

  it('should have access to update manager users', async () => {
    const mng = await manager();
    const mng2 = await manager();
    await expect(ensureAuthorized(mng, mng2, 'update')).resolves.not.toThrow();
  });

  it('should not have access to update admin users', async () => {
    const mng = await manager();
    const adm = await admin();
    await expect(ensureAuthorized(mng, adm, 'update')).rejects.toThrow(Forbidden);
  });

  it('should have access to list trips', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'trip', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit his trips', async () => {
    const mng = await manager();

    const trip = await createTrip({ user: mng });

    await expect(ensureAuthorized(mng, trip, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his trips', async () => {
    const mng = await manager();

    const trip = await createTrip({ user: mng });

    await expect(ensureAuthorized(mng, trip, 'update')).resolves.not.toThrow();
  });

  it('should have access to delete his trips', async () => {
    const mng = await manager();

    const trip = await createTrip({ user: mng });

    await expect(ensureAuthorized(mng, trip, 'delete')).resolves.not.toThrow();
  });

  it('should not have access to edit someone elses trips', async () => {
    const mng = await manager();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update someone elses trips', async () => {
    const mng = await manager();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'update')).rejects.toThrow(Forbidden);
  });

  it('should not have access to delete someone elses trips', async () => {
    const mng = await manager();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'delete')).rejects.toThrow(Forbidden);
  });
});

describe('The regular user', async () => {
  it('should have access to list trips', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, 'trip', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit his trips', async () => {
    const usr = await user();

    const trip = await createTrip({ user: usr });

    await expect(ensureAuthorized(usr, trip, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his trips', async () => {
    const usr = await user();

    const trip = await createTrip({ user: usr });

    await expect(ensureAuthorized(usr, trip, 'update')).resolves.not.toThrow();
  });

  it('should have access to delete his trips', async () => {
    const usr = await user();

    const trip = await createTrip({ user: usr });

    await expect(ensureAuthorized(usr, trip, 'delete')).resolves.not.toThrow();
  });

  it('should not have access to edit someone elses trips', async () => {
    const usr = await user();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update someone elses trips', async () => {
    const usr = await user();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'update')).rejects.toThrow(Forbidden);
  });

  it('should not have access to delete someone elses trips', async () => {
    const usr = await user();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'delete')).rejects.toThrow(Forbidden);
  });

  it('should have access to edit his profile', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, usr, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his profile', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, usr, 'update')).resolves.not.toThrow();
  });

  it('should not have access to list users', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, 'user', 'list')).rejects.toThrow(Forbidden);
  });

  it('should not have access to edit other users', async () => {
    const usr = await user();
    const usr2 = await createUser();

    await expect(ensureAuthorized(usr, usr2, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update other users', async () => {
    const usr = await user();
    const usr2 = await createUser();

    await expect(ensureAuthorized(usr, usr2, 'update')).rejects.toThrow(Forbidden);
  });
});

describe('An anonymous user', () => {
  it('should not have access to anything', async () => {
    await expect(ensureAuthorized(null, 'trip', 'list')).rejects.toThrow(Unauthorized);
  });
});

describe('An inactive user', () => {
  it('should not have access to anything', async () => {
    const usr = await createUser({ isActive: false });
    await expect(ensureAuthorized(usr, 'trip', 'list')).rejects.toThrow(Unauthorized);
  });
});
