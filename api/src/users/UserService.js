import mongoose from 'mongoose';
import { NotFound, Forbidden, BadRequest } from 'rest-api-errors';
import formatMongooseError from 'mongoose-error-beautifier';
import ensureAuthorized from '../auth/Acl';
import User from './User';

class UserService {
  constructor(user) {
    this.currUser = user;
  }

  async update(id, userData) {
    const user = await this.ensureUserExists(id);

    await this.ensureAuthorized('update', user);

    if (user._id.equals(this.currUser.id)) {
      if (userData.role !== undefined && userData.role !== this.currUser.role) {
        throw new Forbidden('forbidden', 'The user cannot change his own role.');
      }

      if (userData.isActive !== undefined && userData.isActive !== this.currUser.isActive) {
        throw new Forbidden('forbidden', 'The user cannot change his own state.');
      }
    }

    user.set(userData);

    if (user.isModified('email')) {
      const exists = await User.count({ email: user.email });

      if (exists) {
        throw new BadRequest('bad-request', `The email ${user.email} is already in use by another account.`);
      }
    }

    const error = user.validateSync();

    if (error) {
      const badRequest = new BadRequest('bad-request', 'User validation failed.');
      badRequest.errors = formatMongooseError(error);
      throw badRequest;
    }

    await user.save();

    return user.toObject();
  }

  async get(id) {
    const user = await this.ensureUserExists(id);

    await this.ensureAuthorized('edit', user);

    return user.toObject();
  }

  async list(options) {
    await this.ensureAuthorized('list');

    const opts = this.sanitizeListOpts(options);

    const skip = (opts.page - 1) * opts.pageSize;

    let conditions = {};

    if (opts.search) {
      const regex = new RegExp(opts.search, 'i');
      conditions = { $or: [{ name: regex }, { email: regex }] };
    }

    const totalCount = await User.count(conditions);
    const userModels = await User.find(conditions, null, { skip, limit: opts.pageSize, sort: { createdAt: -1 } });
    const users = userModels.map(u => u.toObject());

    return { totalCount, users };
  }

  sanitizeListOpts(options) {
    const opts = options || {};
    const search = opts.search || null;

    const page = parseInt(opts.page || 1, 10);
    const pageSize = parseInt(opts.pageSize || 20, 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequest('bad-request', 'The page should be a number greater than zero.');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequest('bad-request', 'The page size should be a number greater than zero.');
    }

    return {
      search,
      page,
      pageSize,
    };
  }

  async ensureUserExists(id) {
    const notFound = new NotFound('not-found', 'User not found.');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw notFound;
    }

    const user = await User.findById(id);

    if (!user) {
      throw notFound;
    }

    return user;
  }

  async ensureAuthorized(action, resource) {
    ensureAuthorized(this.currUser, resource || 'user', action);
  }
}

export default UserService;
