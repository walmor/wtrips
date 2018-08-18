import mongoose from 'mongoose';
import startDatabase, { diconnectDatabase } from '../../database';
import { createUser, createUsers, createTrips } from './helpers';

async function clearDatabase() {
  const collections = await mongoose.connection.db.collections();
  return Promise.all(collections.map(c => c.remove()));
}

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

  await admin.save();
  await user.save();
  await manager.save();

  const users = [admin, user, manager];

  const randomUsers = await createUsers(2);
  users.push(...randomUsers);

  return Promise.all(users.map(usr => createTrips(20, usr)));
}

/* eslint-disable no-console */
startDatabase()
  .then(async () => {
    try {
      console.log('Cleaning up the database...');
      await clearDatabase();

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
    await diconnectDatabase();
  });
