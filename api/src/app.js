import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import 'express-async-errors';
import errorHandler from 'express-error-handler';
import config from './config';
import { setCurrentUser } from './auth/AuthController';
import routes from './routes';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(jwt({ secret: config.jwt.secret, requestProperty: 'auth' }).unless({ path: [/^\/api\/auth/] }));

app.use(setCurrentUser);

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
