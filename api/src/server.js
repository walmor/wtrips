import http from 'http';
import startDatabase from './database';
import config from './config';
import app from './app';

/* eslint-disable no-console */

startDatabase()
  .then(() => http.createServer(app).listen(config.app.port))
  .then((srv) => {
    console.log(`Server listening on port ${srv.address().port}.`);
  })
  .catch((err) => {
    console.error(`Error starting server: ${err}`);
  });
