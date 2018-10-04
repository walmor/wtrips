import initKnex from 'knex';
import { Model } from 'objection';
import { merge } from 'lodash';
import knexCleaner from 'knex-cleaner';
import config from '../../config';
import { createUser, createUsers, createTrips } from './helpers';

async function createDatabaseIfNotExists() {
  const { database } = config.knex.connection;
  const cfg = merge({}, config.knex, { connection: { database: 'postgres' } });

  const knexMaster = initKnex(cfg);

  const result = await knexMaster.raw('SELECT 1 FROM pg_database WHERE datname = ?', database);

  if (result.rowCount === 0) {
    await knexMaster.raw(`CREATE DATABASE ${database}`);
  }

  return knexMaster.destroy();
}

const testDbManager = {
  get db() {
    if (!this.knex) {
      this.knex = initKnex(config.knex);
      Model.knex(this.knex);
    }

    return this.knex;
  },

  async init() {
    await createDatabaseIfNotExists();
    await this.clearDatabase();
    return this.migrate();
  },

  async clearDatabase() {
    const migTable = config.knex.migrations.tableName;
    return knexCleaner.clean(this.db, {
      ignoreTables: [migTable, `${migTable}_lock`],
    });
  },

  async migrate() {
    return this.db.migrate.latest();
  },

  async seedDatabase() {
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
  },

  async stop() {
    return this.db.destroy();
  },
};

export default testDbManager;
