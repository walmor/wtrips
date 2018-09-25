import * as yup from 'yup';
import xss from 'xss';
import { BadRequest } from 'http-errors';
import userRepository from './UserRepository';

const sanitize = new xss.FilterXSS({
  whiteList: [],
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
});

const name = yup
  .string()
  .trim()
  .required()
  .min(3)
  .max(50)
  .transform(v => sanitize.process(v));

const email = yup
  .string()
  .required()
  .email()
  .lowercase();

const emailUniqueMessage = 'This email is already in use.';

async function isEmailUnique(value, id) {
  if (!value) return Promise.resolve(true);
  return userRepository.isEmailAvailable(value, id);
}

const password = yup.string().min(4);

const isActive = yup.boolean();

const role = yup.string().oneOf(['user', 'manager', 'admin']);

const createUserSchema = yup.object().shape({
  name,
  email: email.test('unique-email', emailUniqueMessage, isEmailUnique),
  password: password.required(),
  role: role.transform(() => 'user').default('user'),
  isActive: isActive.transform(() => true).default(true),
});

const updateUserSchema = yup.object().shape({
  id: yup.number(),
  name,
  email: email.test('unique-email', emailUniqueMessage, async function (value) {
    return isEmailUnique(value, this.parent.id);
  }),
  password,
  currentPassword: yup.string().when('password', {
    is: p => !!p,
    then: password.required('To change the password is required to inform the current one.'),
    otherwise: yup.string().notRequired(),
  }),
  role,
  isActive,
});

async function validateAndSanitizeUserData(action, data) {
  const schema = action === 'create' ? createUserSchema : updateUserSchema;
  try {
    return await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const badRequest = new BadRequest('User validation failed.');
      badRequest.errors = err.errors;
      throw badRequest;
    }
    throw err;
  }
}

export default validateAndSanitizeUserData;
