import testDbManager from './test-db';
import { createUser, createUsers, createTrips } from './helpers';

async function seedDatabase() {
  const admin = await createUser({
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
  });

  const user = await createUser({
    name: 'User',
    email: 'user@example.com',
    role: 'user',
  });

  const manager = await createUser({
    name: 'Manager',
    email: 'manager@example.com',
    role: 'manager',
  });

  const users = [admin, user, manager];

  const randomUsers = await createUsers(2);
  users.push(...randomUsers);

  return Promise.all(users.map(usr => createTrips(20, usr)));
}

/* eslint-disable no-console */
testDbManager
  .init()
  .then(async () => {
    try {
      console.log('Cleaning up the database...');
      await testDbManager.clearDatabase();

      console.log('Seeding the database...');
      await seedDatabase();

      console.log('Database sucessfully seeded.');
    } catch (err) {
      console.error(`Error seeding database: ${err}`);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(`Error starting database: ${err}`);
    process.exit(1);
  })
  .finally(async () => {
    await testDbManager.stop();
  });
