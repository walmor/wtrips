import { NotFound, Forbidden, BadRequest } from 'http-errors';
import ensureAuthorized from '../auth/Acl';
import validateAndSanitizeUserData from './UserSchema';
import userRepository from './UserRepository';

class UserService {
  constructor(user) {
    this.currUser = user;
  }

  async update(id, userData) {
    const user = await this.ensureUserExists(id);

    await this.ensureAuthorized('update', user);

    const data = await validateAndSanitizeUserData('update', { id: user.id, ...userData });

    if (user.id === this.currUser.id) {
      if (data.role !== undefined && data.role !== this.currUser.role) {
        throw new Forbidden('The user cannot change his own role.');
      }

      if (data.isActive !== undefined && data.isActive !== this.currUser.isActive) {
        throw new Forbidden('The user cannot change his own state.');
      }

      if (data.password) {
        const valid = await user.comparePassword(data.currentPassword);

        if (!valid) {
          throw new BadRequest('The current password is incorrect.');
        }
      }
    } else if (data.password) {
      throw new Forbidden('Only the user is allowed to changed his password.');
    } else if (data.role === 'admin' && this.currUser.role === 'manager') {
      throw new Forbidden('A manager user cannot set the user role to admin.');
    }

    const updatedUser = await userRepository.update(user.id, userData);

    return updatedUser.toObject();
  }

  async get(id) {
    const user = await this.ensureUserExists(id);

    await this.ensureAuthorized('edit', user);

    return user.toObject();
  }

  async list(options) {
    await this.ensureAuthorized('list');

    const opts = this.sanitizeListOpts(options);

    return userRepository.list(opts);
  }

  sanitizeListOpts(options) {
    const opts = options || {};
    const search = opts.search || null;

    const page = parseInt(opts.page || 1, 10);
    const pageSize = parseInt(opts.pageSize || 20, 10);
    let isActive = opts.isActive !== undefined ? opts.isActive.toLowerCase() : null;
    const isManager = this.currUser.role === 'manager';

    if (isActive === '' || isActive === 'true') {
      isActive = true;
    } else if (isActive === 'false') {
      isActive = false;
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequest('The page should be a number greater than zero.');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequest('The page size should be a number greater than zero.');
    }

    return {
      search,
      page,
      pageSize,
      isActive,
      isManager,
    };
  }

  async ensureUserExists(id) {
    const notFound = new NotFound('User not found.');
    const userId = parseInt(id, 10);

    if (!Number.isInteger(userId)) {
      throw notFound;
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw notFound;
    }

    return user;
  }

  async ensureAuthorized(action, resource) {
    await ensureAuthorized(this.currUser, resource || 'user', action);
  }
}

export default UserService;
