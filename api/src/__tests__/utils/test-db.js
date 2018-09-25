import initKnex from 'knex';
import { Model } from 'objection';
import { merge } from 'lodash';
import knexCleaner from 'knex-cleaner';
import config from '../../config';

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
    return this.db.migrate.latest();
  },

  async clearDatabase() {
    const migTable = config.knex.migrations.tableName;
    return knexCleaner.clean(this.db, {
      ignoreTables: [migTable, `${migTable}_lock`],
    });
  },

  async stop() {
    return this.db.destroy();
  },
};

// testDbManager
//   .init()
//   .then((res) => {
//     console.log('finish', res);
//   })
//   .catch((err) => {
//     console.error(err);
//   })
//   .finally(() => {
//     testDbManager.stop();
//   });

export default testDbManager;
