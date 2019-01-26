import path from 'path';
import { knexSnakeCaseMappers } from 'objection';

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
