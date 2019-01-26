import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import 'express-async-errors';
import errorHandler from 'express-error-handler';
import config from './config';
import setupRequest from './setup';
import routes from './routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// prettier-ignore
const whitelist = [
  /\/auth\/sign(in|up)$/,
  /\/auth\/email-available$/,
  /\/tests\/seed-db$/,
];

app.use(jwt({ secret: config.jwt.secret, requestProperty: 'auth' }).unless({ path: whitelist }));

app.use(setupRequest);

app.use('/api', routes);

app.use(
  errorHandler({
    serializer(err) {
      const body = {
        status: err.status,
        message: err.message,
      };

      if (err.errors) body.errors = err.errors;

      return body;
    },
  }),
);

export default app;
