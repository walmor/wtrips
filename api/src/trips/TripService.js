import mongoose from 'mongoose';
import moment from 'moment';
import { NotFound, BadRequest, Forbidden } from 'http-errors';
import ensureAuthorized from '../auth/Acl';
import Trip from './Trip';
import User from '../users/User';
import validateAndSanitizeTripData from './TripSchema';

const BASIC_USER_FIELDS = 'name isActive';

class TripService {
  constructor(user) {
    this.currUser = user;
  }

  async create(tripData) {
    await this.ensureAuthorized('create');

    return this.saveTrip(new Trip(), tripData);
  }

  async update(id, tripData) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('update', trip);

    return this.saveTrip(trip, tripData);
  }

  async delete(id) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('delete', trip);

    await Trip.findByIdAndRemove(trip.id);

    return {
      success: true,
      message: 'Trip deleted successfully.',
      tripId: trip._id,
    };
  }

  async get(id) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('edit', trip);

    await trip.populate({ path: 'user', select: BASIC_USER_FIELDS }).execPopulate();

    return trip.toObject();
  }

  async list(options) {
    await this.ensureAuthorized('list');

    const opts = this.sanitizeListOpts(options);

    const skip = (opts.page - 1) * opts.pageSize;

    let conditions = opts.userId ? { user: opts.userId } : {};

    if (opts.search) {
      const regex = new RegExp(opts.search, 'i');
      conditions = { $and: [conditions, { $or: [{ destination: regex }, { comment: regex }] }] };
    }

    // #region First filter. Get trips that are happening within the filter range. Less intuitive.
    /*
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
    */
    // #endregion

    // #region Second filter. Get trips that start within the filter range. More intuitive.

    if (opts.startDate) {
      conditions = {
        $and: [conditions, { startDate: { $gte: opts.startDate } }],
      };
    }

    if (opts.endDate) {
      conditions = {
        $and: [conditions, { startDate: { $lte: opts.endDate } }],
      };
    }

    // #endregion

    const totalCount = await Trip.countDocuments(conditions);
    const tripModels = await Trip.find(conditions, null, {
      skip,
      limit: opts.pageSize,
      sort: { [opts.sortField]: opts.sortOrder },
    }).populate('user', BASIC_USER_FIELDS);

    const trips = tripModels.map(t => t.toObject());

    return { totalCount, trips };
  }

  async getTravelPlan(options) {
    await this.ensureAuthorized('list');

    const opts = this.getTravelPlanOpts(options);
    const { baseDate } = opts;
    const startDate = baseDate.toDate();
    const endDate = baseDate.endOf('month').toDate();

    let conditions = opts.userId ? { user: opts.userId } : {};

    conditions = {
      $and: [conditions, { startDate: { $gte: startDate } }, { startDate: { $lte: endDate } }],
    };

    const tripModels = await Trip.find(conditions, null, { sort: { startDate: 1 } }).populate(
      'user',
      BASIC_USER_FIELDS,
    );

    return tripModels.map(t => t.toObject());
  }

  sanitizeListOpts(options) {
    const opts = options || {};
    const search = opts.search || null;

    const page = parseInt(opts.page || 1, 10);
    const pageSize = parseInt(opts.pageSize || 20, 10);

    const startDate = opts.startDate ? moment(opts.startDate) : null;
    const endDate = opts.endDate ? moment(opts.endDate).endOf('day') : null;
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

    // eslint-disable-next-line prefer-const
    let [sortField, sortOrder] = sort.split(':');

    if (Trip.schema.pathType(sortField) === 'adhocOrUndefined') {
      throw new BadRequest('The sort field is invalid.');
    }

    sortOrder = sortOrder === 'desc' ? -1 : 1;

    const userId = this.sanitizeUserIdFilter(opts);

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

  getTravelPlanOpts(options) {
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

    let baseDate = moment([year, month - 1, 1]);

    if (year === currYear && month === currMonth) {
      baseDate = moment().startOf('day');
    } else if (baseDate.isBefore(moment())) {
      throw new BadRequest('The filter date should be greater than the current date.');
    }

    const userId = this.sanitizeUserIdFilter(opts);

    return { userId, baseDate };
  }

  sanitizeUserIdFilter(opts) {
    let userId = this.currUser.id;

    if (this.currUser.role === 'admin') {
      if (opts.userId && !mongoose.Types.ObjectId.isValid(opts.userId)) {
        throw new BadRequest('Invalid user id.');
      }

      userId = opts.userId || null;
    }

    return userId;
  }

  async saveTrip(trip, tripData) {
    const data = await validateAndSanitizeTripData(tripData);

    trip.set(data);

    if (data.userId) {
      if (this.currUser.role === 'admin') {
        const user = await User.findById(data.userId);
        if (!user) throw new BadRequest('The userId is invalid. User not found.');

        trip.user = data.userId;
      } else {
        throw new Forbidden('Access denied');
      }
    } else {
      trip.user = this.currUser.id;
    }

    await trip.save();

    await trip.populate({ path: 'user', select: BASIC_USER_FIELDS }).execPopulate();

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
    await ensureAuthorized(this.currUser, resource || 'trip', action);
  }
}

export default TripService;
