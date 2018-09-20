import moment from 'moment';
import { NotFound, BadRequest, Forbidden } from 'http-errors';
import ensureAuthorized from '../auth/Acl';
import Trip from './Trip';
import validateAndSanitizeTripData from './TripSchema';
import userRepository from '../users/UserRepository';
import tripRepository from './TripRepository';

class TripService {
  constructor(user) {
    this.currUser = user;
  }

  async create(tripData) {
    await this.ensureAuthorized('create');

    const data = await this.getTripData(tripData);

    const trip = await tripRepository.insert(data);

    return trip.toObject();
  }

  async update(id, tripData) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('update', trip);

    const data = await this.getTripData(tripData);

    const updatedTrip = await tripRepository.update(trip.id, data);

    return updatedTrip.toObject();
  }

  async delete(id) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('delete', trip);

    await tripRepository.delete(trip.id);

    return {
      success: true,
      message: 'Trip deleted successfully.',
      tripId: trip.id,
    };
  }

  async get(id) {
    const trip = await this.ensureTripExists(id);

    await this.ensureAuthorized('edit', trip);

    return trip.toObject();
  }

  async list(options) {
    await this.ensureAuthorized('list');

    const opts = await this.sanitizeListOpts(options);

    return tripRepository.list(opts);
  }

  async getTravelPlan(options) {
    await this.ensureAuthorized('list');

    const opts = this.getTravelPlanOpts(options);

    return tripRepository.getTravelPlan(opts);
  }

  async sanitizeListOpts(options) {
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

    const tableMetadata = await Trip.fetchTableMetadata();

    if (!tableMetadata.columns.includes(sortField)) {
      throw new BadRequest('The sort field is invalid.');
    }

    sortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

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

    const startDate = baseDate.toDate();
    const endDate = baseDate.endOf('month').toDate();

    const userId = this.sanitizeUserIdFilter(opts);

    return { userId, startDate, endDate };
  }

  sanitizeUserIdFilter(opts) {
    let userId = this.currUser.id;

    if (this.currUser.role === 'admin' && opts.userId) {
      const optsUserId = parseInt(opts.userId, 10);

      if (!Number.isInteger(optsUserId)) {
        throw new BadRequest('Invalid user id.');
      }

      userId = optsUserId || null;
    }

    return userId;
  }

  async getTripData(tripData) {
    const data = await validateAndSanitizeTripData(tripData);

    if (data.userId) {
      if (this.currUser.role === 'admin') {
        const user = await userRepository.findById(data.userId);
        if (!user) throw new BadRequest('The userId is invalid. User not found.');

        data.user = user;
      } else {
        throw new Forbidden('Access denied');
      }
    } else {
      data.user = this.currUser;
    }

    return data;
  }

  async ensureTripExists(id) {
    const notFound = new NotFound('Trip not found.');
    const tripId = parseInt(id, 10);

    if (!Number.isInteger(tripId)) {
      throw notFound;
    }

    const trip = await tripRepository.findById(tripId);

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
