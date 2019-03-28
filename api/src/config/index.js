import path from 'path';
import * as url from 'url';
import { knexSnakeCaseMappers } from 'objection';

if (process.env.API_HOST === 'heroku') {
  process.env.API_PORT = process.env.PORT;

  console.log('port:', process.env.PORT, process.env.API_PORT);

  const dburl = url.parse(process.env.DATABASE_URL);
  const [dbuser, dbpass] = dburl.auth.split(':');

  process.env.DB_HOST = dburl.hostname;
  process.env.DB_PORT = dburl.port;
  process.env.DB_NAME = dburl.path.substr(1);
  process.env.DB_USER = dbuser;
  process.env.DB_PASSWORD = dbpass;
}

const config = {
  app: {
    port: parseInt(process.env.API_PORT, 10) || 3000,
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

export default config;
