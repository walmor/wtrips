import dotenv from 'dotenv';
import _ from 'lodash';
import path from 'path';
import { knexSnakeCaseMappers } from 'objection';

const env = process.env.NODE_ENV || 'dev';

dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

const schema = {
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
  },
  knex: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, '../db/migrations'),
    },
    ...knexSnakeCaseMappers(),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRESIN || '30d',
  },
};

// Default configurations
const defaults = {
  // dev environment
  dev: {
    knex: {
      connection: {
        host: 'localhost',
        database: 'wtrips_dev',
      },
    },
  },

  // test environment
  test: {
    knex: {
      connection: {
        host: 'localhost',
        database: 'wtrips_test',
      },
    },
  },
};

const config = _.merge({}, defaults[env], schema);

export default config;
