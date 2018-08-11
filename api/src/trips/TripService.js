import mongoose from 'mongoose';
import moment from 'moment';
import { NotFound, BadRequest } from 'http-errors';
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
      throw new BadRequest('The trip user cannot be changed.');
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

  async getTravelPlan(options) {
    await this.ensureAuthorized('list');

    const userId = this.currUser.id;

    const baseDate = this.getTravelPlanBaseDate(options);
    const startDate = baseDate.toDate();
    const endDate = baseDate.endOf('month').toDate();

    const conditions = {
      $and: [{ userId }, { startDate: { $gte: startDate } }, { startDate: { $lte: endDate } }],
    };

    const tripModels = await Trip.find(conditions, null, {
      sort: { startDate: 1 },
    });

    return tripModels.map(t => t.toObject());
  }

  sanitizeListOpts(options) {
    const opts = options || {};
    const search = opts.search || null;

    const page = parseInt(opts.page || 1, 10);
    const pageSize = parseInt(opts.pageSize || 20, 10);

    const startDate = opts.startDate ? moment(opts.startDate) : null;
    const endDate = opts.endDate ? moment(opts.endDate) : null;
    const sort = opts.sort || 'startDate:asc';

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequest('The page should be a number greater than zero.');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequest('The page size should be a number greater than zero.');
    }

    if (startDate && !startDate.isValid()) {
      throw new BadRequest('The start date filter must be a valid date.');
    }

    if (endDate && !endDate.isValid()) {
      throw new BadRequest('The end date filter must be a valid date.');
    }

    if (startDate && endDate && endDate.isBefore(startDate)) {
      throw new BadRequest('The end date should be greater than or equal to the start date.');
    }

    let [sortField, sortOrder] = sort.split(':');

    if (Trip.schema.pathType(sortField) === 'adhocOrUndefined') {
      throw new BadRequest('The sort field is invalid.');
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

  getTravelPlanBaseDate(options) {
    const opts = options || {};

    const currMonth = moment().month() + 1;
    const currYear = moment().year();

    const month = parseInt(opts.month || currMonth, 10);
    const year = parseInt(opts.year || currYear, 10);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequest('The month should be a number between 1 and 12.');
    }

    if (!Number.isInteger(year) || year < currYear) {
      throw new BadRequest('The year should be a number greater than or equal to the current year.');
    }

    if (year === currYear && month === currMonth) {
      return moment().startOf('day');
    }

    const baseDate = moment(new Date(year, month - 1, 1));

    if (baseDate.isBefore(moment())) {
      throw new BadRequest('The filter date should be greater than the current date.');
    }

    return baseDate;
  }

  async saveTrip(trip) {
    const error = trip.validateSync();

    if (error) {
      const badRequest = new BadRequest('Trip validation failed.');
      badRequest.errors = formatMongooseError(error);
      throw badRequest;
    }

    if (moment(trip.endDate).diff(trip.startDate, 'days') < 0) {
      throw new BadRequest('The end date should be less than or equal to the start date.');
    }

    await trip.save();

    return trip.toObject();
  }

  async ensureTripExists(id) {
    const notFound = new NotFound('Trip not found.');

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
