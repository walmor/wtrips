import testDbManager from './test-db';

/* eslint-disable no-console */
testDbManager
  .init()
  .then(async () => {
    console.log('Seeding the database...');
    await testDbManager.seedDatabase();

    console.log('Database sucessfully seeded.');
  })
  .catch((err) => {
    console.error(`Error seeding database: ${err}`);
    process.exit(1);
  })
  .finally(async () => {
    await testDbManager.stop();
  });
