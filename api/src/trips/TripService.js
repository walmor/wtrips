import mongoose from 'mongoose';
import moment from 'moment';
import { NotFound, BadRequest } from 'rest-api-errors';
import formatMongooseError from 'mongoose-error-beautifier';
import ensureAuthorized from '../auth/Acl';
import Trip from './Trip';

class TripService {
  constructor(user) {
    this.currUser = user;
  }

  async create(tripData) {
    await this.ensureAuthorized('create');

    tripData.userId = tripData.userId || this.currUser.id;

    const now = new Date();
    const dates = { createdAt: now, updatedAt: now };

    const trip = new Trip({ ...tripData, ...dates });

    return this.saveTrip(trip);
  }

  async update(id, tripData) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('update', trip);

    if (tripData.userId !== undefined && tripData.userId !== trip.userId) {
      throw new BadRequest('bad-request', 'The trip user cannot be changed.');
    }

    trip.set({ ...tripData, ...{ updatedAt: new Date() } });

    return this.saveTrip(trip);
  }

  async get(id) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('edit', trip);

    return trip.toObject();
  }

  async list(options) {
    await this.ensureAuthorized('list');

    const opts = this.sanitizeListOpts(options);

    const skip = (opts.page - 1) * opts.pageSize;

    let conditions = opts.userId ? { userId: opts.userId } : {};

    if (opts.search) {
      const regex = new RegExp(opts.search, 'i');
      conditions = { $and: [conditions, { $or: [{ destination: regex }, { comment: regex }] }] };
    }

    if (opts.startDate) {
      conditions = {
        $and: [
          conditions,
          {
            $or: [{ startDate: { $gte: opts.startDate } }, { endDate: { $gte: opts.startDate } }],
          },
        ],
      };
    }

    if (opts.endDate) {
      conditions = {
        $and: [
          conditions,
          {
            $or: [{ startDate: { $lte: opts.endDate } }, { endDate: { $lte: opts.endDate } }],
          },
        ],
      };
    }

    const totalCount = await Trip.countDocuments(conditions);
    const tripModels = await Trip.find(conditions, null, {
      skip,
      limit: opts.pageSize,
      sort: { [opts.sortField]: opts.sortOrder },
    });

    const trips = tripModels.map(t => t.toObject());

    return { totalCount, trips };
  }

  sanitizeListOpts(options) {
    const opts = options || {};
    const search = opts.search || null;

    let startDate = moment(opts.startDate || null);
    let endDate = moment(opts.endDate || null);
    const sort = opts.sort || 'createdAt:desc';

    let page = parseInt(opts.page, 10);
    let pageSize = parseInt(opts.pageSize, 10);

    page = Number.isInteger(page) ? page : 1;
    pageSize = Number.isInteger(pageSize) ? pageSize : 20;
    startDate = startDate.isValid() ? startDate.toDate() : null;
    endDate = endDate.isValid() ? endDate.toDate() : null;

    let [sortField, sortOrder] = sort.split(':');

    if (Trip.schema.pathType(sortField) === 'adhocOrUndefined') {
      sortField = 'createdAt';
    }

    sortOrder = sortOrder === 'desc' ? -1 : 1;

    let userId = this.currUser.id;

    if (this.currUser.role === 'admin') {
      userId = opts.userId || null;
    }

    return {
      search,
      page,
      pageSize,
      startDate,
      endDate,
      sortField,
      sortOrder,
      userId,
    };
  }

  async saveTrip(trip) {
    const error = trip.validateSync();

    if (error) {
      const badRequest = new BadRequest('bad-request', 'Trip validation failed.');
      badRequest.errors = formatMongooseError(error);
      throw badRequest;
    }

    if (moment(trip.endDate).diff(trip.startDate, 'days') < 0) {
      throw new BadRequest('bad-request', 'The end date should be less than or equal to the start date.');
    }

    await trip.save();

    return trip.toObject();
  }

  async ensureTripExists(id) {
    const notFound = new NotFound('not-found', 'Trip not found.');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw notFound;
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      throw notFound;
    }

    return trip;
  }

  async ensureAuthorized(action, resource) {
    ensureAuthorized(this.currUser, resource || 'trip', action);
  }
}

export default TripService;
