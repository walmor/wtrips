import { Acl } from 'virgen-acl';
import { promisify } from 'util';
import { Forbidden, Unauthorized } from 'http-errors';
import User from '../users/User';
import Trip from '../trips/Trip';

const acl = new Acl();

// Set up roles
acl.addRole('user');
acl.addRole('manager', 'user');
acl.addRole('admin');

// Set up resources
acl.addResource('trip');
acl.addResource('user');

// Set up access rules (LIFO)
acl.deny();
acl.allow('admin');
acl.allow('user', 'trip', ['create', 'list']);
acl.allow('user', 'trip', ['edit', 'update', 'delete'], (err, role, resource, action, result, next) => {
  if (!(role instanceof User) || !(resource instanceof Trip)) return next();

  if (role._id.equals(resource.user._id)) {
    return result(null, true);
  }

  return result(null, false);
});

acl.allow('user', 'user', ['edit', 'update'], (err, role, resource, action, result, next) => {
  if (!(role instanceof User) || !(resource instanceof User)) return next();

  if (role._id.equals(resource._id)) {
    return result(null, true);
  }

  return result(null, false);
});

acl.allow('manager', 'user', 'list');
acl.allow('manager', 'user', ['edit', 'update'], (err, role, resource, action, result, next) => {
  if (!(role instanceof User) || !(resource instanceof User)) return next();

  if (resource.role === 'admin') {
    return result(null, false);
  }

  return result(null, true);
});

async function ensureAuthorized(user, resource, action) {
  if (!user || !user.isActive) {
    throw new Unauthorized('User not authenticated or blocked.');
  }

  const query = promisify(acl.query.bind(acl));
  const authorized = await query(user, resource, action);

  if (!authorized) {
    throw new Forbidden('Access denied');
  }
}

export { ensureAuthorized as default };
