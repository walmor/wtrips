import * as yup from 'yup';
import xss from 'xss';
import mongoose from 'mongoose';
import { BadRequest } from 'http-errors';

const sanitize = new xss.FilterXSS({
  whiteList: [],
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
});

const tripSchema = yup.object().shape({
  destination: yup
    .string()
    .required()
    .min(3)
    .max(50)
    .transform(v => sanitize.process(v)),
  comment: yup
    .string()
    .max(1000)
    .transform(v => sanitize.process(v)),
  startDate: yup.date().required(),
  endDate: yup
    .date()
    .required()
    .min(yup.ref('startDate'), 'The endDate should be greater than or equal to the startDate'),
  userId: yup
    .string()
    .test('invalid-user-id', 'The user id is invalid.', id => !id || mongoose.Types.ObjectId.isValid(id)),
});

async function validateAndSanitizeTripData(data) {
  try {
    return await tripSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const badRequest = new BadRequest('Trip validation failed.');
      badRequest.errors = err.errors;
      throw badRequest;
    }
    throw err;
  }
}

export default validateAndSanitizeTripData;
