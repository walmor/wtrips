import { NotFound, BadRequest } from 'http-errors';
import moment from 'moment';
import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import { createUser, createTrip, createTrips } from '../__tests__/utils/helpers';
import * as acl from '../auth/Acl';
import TripService from './TripService';

beforeAll(async () => {
  await mongodbInMemory.init();
  acl.default = jest.fn(() => true);
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
  acl.default.mockClear();
});

async function getServiceWithCurrUsr() {
  const currUser = await createUser({ role: 'admin' });
  await currUser.save();

  const service = new TripService(currUser);

  return { currUser, service };
}

function getTripData() {
  return {
    destination: 'Brazil',
    startDate: moment()
      .startOf('month')
      .toDate(),
    endDate: moment()
      .endOf('month')
      .toDate(),
  };
}

describe('The TripService', () => {
  describe('when creating a trip', () => {
    it('should create a trip with valid data', async () => {
      const { service } = await getServiceWithCurrUsr();

      const tripData = getTripData();

      const trip = await service.create(tripData);

      expect(trip.destination).toEqual(tripData.destination);
      expect(trip.startDate).toEqual(tripData.startDate);
      expect(trip.endDate).toEqual(tripData.endDate);
    });

    it('should throw BadRequest if the trip data is invalid', async () => {
      const { service } = await getServiceWithCurrUsr();

      expect.assertions(2);

      const tripData = {
        destination: null,
        startDate: null,
        endDate: null,
      };

      try {
        await service.create(tripData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.errors).toBeDefined();
      }
    });

    it('should throw BadRequest if the endDate is greater than startDate', async () => {
      const { service } = await getServiceWithCurrUsr();

      expect.assertions(1);

      const date = moment();

      const tripData = {
        destination: 'Brazil',
        startDate: date.toDate(),
        endDate: date.subtract(10, 'days'),
      };

      try {
        await service.create(tripData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequest);
      }
    });

    it('should ensure the user is authorized', async () => {
      const { service } = await getServiceWithCurrUsr();

      await service.create(getTripData());

      expect(acl.default).toHaveBeenCalled();
    });
  });

  describe('when getting a trip by id', () => {
    it('should get an existing trip', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();
      const trip = await createTrip({ user: currUser });
      await trip.save();

      const foundTrip = await service.get(trip.id);

      expect(foundTrip._id.equals(trip.id)).toBe(true);
    });

    it('should throw NotFound if the trip doesnt exist', async () => {
      const { service } = await getServiceWithCurrUsr();

      const get = service.get('any-invalid-id');

      await expect(get).rejects.toThrowError(NotFound);
    });

    it('should ensure the user is authorized', async () => {
      const { service } = await getServiceWithCurrUsr();
      const trip = await createTrip();
      await trip.save();

      await service.get(trip.id);

      expect(acl.default).toHaveBeenCalled();
    });
  });

  describe('when updating a trip', () => {
    it('should throw NotFound if the trip doesnt exist', async () => {
      const { service } = await getServiceWithCurrUsr();

      const get = service.update('any-invalid-id');

      await expect(get).rejects.toThrowError(NotFound);
    });

    it('should ensure the user is authorized ', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const trip = await createTrip({ user: currUser });
      await trip.save();

      await service.update(trip.id, {});

      expect(acl.default).toHaveBeenCalled();
    });

    it('should throw BadRequest if the trip data is invalid', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const trip = await createTrip({ user: currUser });
      await trip.save();

      expect.assertions(2);

      const tripData = {
        destination: null,
        startDate: null,
        endDate: null,
      };

      try {
        await service.update(trip.id, tripData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.errors).toBeDefined();
      }
    });

    it('should not allow the trip user to be changed', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const trip = await createTrip();
      await trip.save();

      expect.assertions(1);

      const tripData = {
        userId: currUser.id,
      };

      try {
        await service.update(trip.id, tripData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequest);
      }
    });

    it('should update an existing trip with valid data', async () => {
      const tripData = {
        destination: 'Canada',
        startDate: moment()
          .startOf('year')
          .toDate(),
        endDate: moment()
          .endOf('year')
          .toDate(),
      };

      const { currUser, service } = await getServiceWithCurrUsr();

      const trip = await createTrip({ user: currUser });
      await trip.save();

      const updatedTrip = await service.update(trip.id, tripData);

      expect(updatedTrip.destination).toEqual(tripData.destination);
      expect(updatedTrip.startDate).toEqual(tripData.startDate);
      expect(updatedTrip.endDate).toEqual(tripData.endDate);
    });
  });

  describe('when listing trips', () => {
    it('should ensure the user is authorized', async () => {
      const { service } = await getServiceWithCurrUsr();

      await service.list();

      expect(acl.default).toHaveBeenCalled();
    });

    it('should return the first 20 trips if no options are passed', async () => {
      const qty = 32;
      await createTrips(qty);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list();

      expect(result.totalCount).toBe(qty);
      expect(result.trips.length).toBe(20);
    });

    it('should throw BadRequest if options are invalid', async () => {
      const qty = 24;
      await createTrips(qty);

      const { service } = await getServiceWithCurrUsr();

      let list = service.list({ page: 'NaN' });
      await expect(list).rejects.toThrow();

      list = service.list({ pageSize: -1 });
      await expect(list).rejects.toThrow();

      list = service.list({ startDate: moment.invalid() });
      await expect(list).rejects.toThrow();

      list = service.list({ endDate: moment.invalid() });
      await expect(list).rejects.toThrow();

      list = service.list({ sort: 'unknown-field' });
      await expect(list).rejects.toThrow();
    });

    it('should return the number of trips acordingly the page size', async () => {
      const pageSize = 10;
      await createTrips(12);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ pageSize });

      expect(result.trips.length).toBe(pageSize);
    });

    it('should handle pagination', async () => {
      const qty = 16;
      const pageSize = 10;
      const page = 2;
      const secPageQty = 6;

      await createTrips(qty);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ page, pageSize });

      expect(result.trips.length).toBe(secPageQty);
    });

    it('should search by destination', async () => {
      const destination = 'UnitTestLand';

      const trip = await createTrip({ destination });
      await trip.save();

      await createTrips(10);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ search: destination });

      expect(result.trips.length).toBe(1);
    });

    it('should search by comment', async () => {
      const comment = 'UnitTest Comment';

      const trip = await createTrip({ comment });
      await trip.save();

      await createTrips(10);

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ search: comment });

      expect(result.trips.length).toBe(1);
    });

    it('should filter by start date', async () => {
      const filterDate = moment('2018-08-01');

      const trips = [];

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(1, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(10, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(-1, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(10, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(-10, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(-5, 'days')
            .toDate(),
        }),
      );

      await Promise.all(trips.map(t => t.save()));

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ startDate: filterDate.toDate() });

      expect(result.trips.length).toBe(2);
    });

    it('should filter by end date', async () => {
      const filterDate = moment('2018-08-01');

      const trips = [];

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(-4, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(-1, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(-1, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(6, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(filterDate)
            .add(1, 'days')
            .toDate(),
          endDate: moment(filterDate)
            .add(5, 'days')
            .toDate(),
        }),
      );

      await Promise.all(trips.map(t => t.save()));

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ endDate: filterDate.toDate() });

      expect(result.trips.length).toBe(2);
    });

    it('should sort accordingly the options', async () => {
      const baseDate = moment('2018-08-01');

      const trips = [];

      trips.push(
        await createTrip({
          startDate: moment(baseDate)
            .add(20, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(30, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(baseDate)
            .add(10, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(20, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          startDate: moment(baseDate)
            .add(1, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(10, 'days')
            .toDate(),
        }),
      );

      await Promise.all(trips.map(t => t.save()));

      const { service } = await getServiceWithCurrUsr();

      const result = await service.list({ sort: 'startDate:asc' });

      expect(result.trips.length).toBe(3);
      expect(result.trips[0].id).toEqual(trips[2].id);
      expect(result.trips[1].id).toEqual(trips[1].id);
      expect(result.trips[2].id).toEqual(trips[0].id);
    });

    it('should return the user id and name', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const trip = await createTrip({ user: currUser });
      await trip.save();

      const result = await service.list();

      expect(result.trips[0].user.name).toBe(currUser.name);
      expect(result.trips[0].user._id.equals(currUser._id)).toBe(true);
    });
  });

  describe('when getting the travel plan', () => {
    it('should get the trips of the current month if no options are passed', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const baseDate = moment().startOf('day');

      const trips = [];

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(-10, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(-5, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(1, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(1, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(1, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(1, 'days')
            .toDate(),
        }),
      );

      await Promise.all(trips.map(t => t.save()));

      const result = await service.getTravelPlan();

      expect(result.length).toBe(2);
    });

    it('should get the trips of the month acordingly the options', async () => {
      const { currUser, service } = await getServiceWithCurrUsr();

      const baseDate = moment()
        .endOf('month')
        .add(2, 'days')
        .startOf('month');

      const trips = [];

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(-10, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(-5, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(2, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(5, 'days')
            .toDate(),
        }),
      );

      trips.push(
        await createTrip({
          user: currUser,
          startDate: moment(baseDate)
            .add(10, 'days')
            .toDate(),
          endDate: moment(baseDate)
            .add(15, 'days')
            .toDate(),
        }),
      );

      await Promise.all(trips.map(t => t.save()));

      const result = await service.getTravelPlan({ month: baseDate.month() + 1, year: baseDate.year() });

      expect(result.length).toBe(2);
    });

    it('should throw BadRequest if the month is invalid', async () => {
      const { service } = await getServiceWithCurrUsr();

      const getTravelPlan = service.getTravelPlan({ month: 'january' });

      await expect(getTravelPlan).rejects.toThrow(BadRequest);
    });

    it('should throw BadRequest if the year is invalid', async () => {
      const { service } = await getServiceWithCurrUsr();

      const getTravelPlan = service.getTravelPlan({ year: 2000 });

      await expect(getTravelPlan).rejects.toThrow(BadRequest);
    });
  });
});
