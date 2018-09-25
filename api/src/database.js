import initKnex from 'knex';
import { Model } from 'objection';
import config from './config';

let knex = null;

export default async function startDatabase() {
  return new Promise((resolve, reject) => {
    try {
      knex = initKnex(config.knex);
      Model.knex(knex);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export async function diconnectDatabase() {
  return knex.destroy();
}
