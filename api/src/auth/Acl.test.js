import { Forbidden } from 'rest-api-errors';
import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import ensureAuthorized from './Acl';
import { createUser, createTrip } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await mongodbInMemory.init();
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
});

describe('The admin user', async () => {
  const admin = async () => createUser({ role: 'admin', email: 'admin@example.com' });

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
  const manager = async () => createUser({ role: 'manager', email: 'manager@example.com' });

  it('should have access to list users', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'user', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit users', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'user', 'edit')).resolves.not.toThrow();
  });

  it('should have access to update users', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'user', 'update')).resolves.not.toThrow();
  });

  it('should have access to list trips', async () => {
    const mng = await manager();
    await expect(ensureAuthorized(mng, 'trip', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit his trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip({ userId: mng.id });

    await expect(ensureAuthorized(mng, trip, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip({ userId: mng.id });

    await expect(ensureAuthorized(mng, trip, 'update')).resolves.not.toThrow();
  });

  it('should have access to delete his trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip({ userId: mng.id });

    await expect(ensureAuthorized(mng, trip, 'delete')).resolves.not.toThrow();
  });

  it('should not have access to edit someone elses trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update someone elses trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'update')).rejects.toThrow(Forbidden);
  });

  it('should not have access to delete someone elses trips', async () => {
    const mng = await manager();
    await mng.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(mng, trip, 'delete')).rejects.toThrow(Forbidden);
  });
});

describe('The regular user', async () => {
  const user = async () => createUser({ role: 'user', email: 'user@example.com' });

  it('should have access to list trips', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, 'trip', 'list')).resolves.not.toThrow();
  });

  it('should have access to edit his trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip({ userId: usr.id });

    await expect(ensureAuthorized(usr, trip, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip({ userId: usr.id });

    await expect(ensureAuthorized(usr, trip, 'update')).resolves.not.toThrow();
  });

  it('should have access to delete his trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip({ userId: usr.id });

    await expect(ensureAuthorized(usr, trip, 'delete')).resolves.not.toThrow();
  });

  it('should not have access to edit someone elses trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update someone elses trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'update')).rejects.toThrow(Forbidden);
  });

  it('should not have access to delete someone elses trips', async () => {
    const usr = await user();
    await usr.save();

    const trip = await createTrip();

    await expect(ensureAuthorized(usr, trip, 'delete')).rejects.toThrow(Forbidden);
  });

  it('should have access to edit his profile', async () => {
    const usr = await user();
    await usr.save();
    await expect(ensureAuthorized(usr, usr, 'edit')).resolves.not.toThrow();
  });

  it('should have access to update his profile', async () => {
    const usr = await user();
    await usr.save();
    await expect(ensureAuthorized(usr, usr, 'update')).resolves.not.toThrow();
  });

  it('should not have access to list users', async () => {
    const usr = await user();
    await expect(ensureAuthorized(usr, 'user', 'list')).rejects.toThrow(Forbidden);
  });

  it('should not have access to edit other users', async () => {
    const usr = await user();
    await usr.save();

    const usr2 = await createUser();
    usr2.save();

    await expect(ensureAuthorized(usr, usr2, 'edit')).rejects.toThrow(Forbidden);
  });

  it('should not have access to update other users', async () => {
    const usr = await user();
    await usr.save();

    const usr2 = await createUser();
    usr2.save();

    await expect(ensureAuthorized(usr, usr2, 'update')).rejects.toThrow(Forbidden);
  });
});
