import mongoose from 'mongoose';
import { NotFound, Forbidden, BadRequest } from 'http-errors';
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
        throw new Forbidden('The user cannot change his own role.');
      }

      if (userData.isActive !== undefined && userData.isActive !== this.currUser.isActive) {
        throw new Forbidden('The user cannot change his own state.');
      }
    }

    user.set(userData);

    try {
      await user.save();
      return user.toObject();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const badRequest = new BadRequest('User validation failed.');
        badRequest.errors = formatMongooseError(err);
        throw badRequest;
      }

      throw err;
    }
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

    const totalCount = await User.countDocuments(conditions);
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
      throw new BadRequest('The page should be a number greater than zero.');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequest('The page size should be a number greater than zero.');
    }

    return {
      search,
      page,
      pageSize,
    };
  }

  async ensureUserExists(id) {
    const notFound = new NotFound('User not found.');

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
