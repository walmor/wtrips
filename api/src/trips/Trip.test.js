import moment from 'moment';
import * as mongodbInMemory from '../__tests__/utils/mongodb-in-memory';
import { createTrip, testRequiredProperty } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await mongodbInMemory.init();
});

afterAll(async () => {
  await mongodbInMemory.stop();
});

beforeEach(async () => {
  await mongodbInMemory.clearDatabase();
});

const testTripRequiredProperty = testRequiredProperty(createTrip);

describe('The trip', () => {
  it('should not be saved without a destination', async () => {
    await testTripRequiredProperty('destination');
  });

  it('should not be saved without a start date', async () => {
    await testTripRequiredProperty('startDate');
  });

  it('should not be saved without an end date', async () => {
    await testTripRequiredProperty('endDate');
  });

  it('should not be saved without a creation date', async () => {
    await testTripRequiredProperty('createdAt');
  });

  it('should not be saved without an update date', async () => {
    await testTripRequiredProperty('updatedAt');
  });

  it('should not be saved if it is not assign to an user', async () => {
    await testTripRequiredProperty('user');
  });

  it('should not have its creation date updated', async () => {
    const trip = await createTrip();
    await trip.save();
    const { createdAt } = trip;

    const testDate = new Date();
    testDate.setMonth((testDate.getMonth() + 1) % 12);

    trip.createdAt = testDate;
    await trip.save();

    expect(trip.createdAt).toEqual(createdAt);
  });

  it('should be saved when is valid', async () => {
    const trip = await createTrip();

    await trip.save();

    expect(trip.id).toBeTruthy();
  });

  describe('when calculating the days left before it starts', () => {
    it('should return the number of days if it is a future trip', async () => {
      const startDate = moment
        .utc()
        .startOf('day')
        .add(10, 'days')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(10);
    });

    it('should return null if it is a past trip', async () => {
      const startDate = moment
        .utc()
        .startOf('day')
        .add(-1, 'days')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(null);
    });

    it('should return zero if the trip starts today', async () => {
      const startDate = moment
        .utc()
        .startOf('day')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(0);
    });
  });
});
