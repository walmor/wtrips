import moment from 'moment';
import testDbManager from '../__tests__/utils/test-db';
import { createTrip, updateTrip, testRequiredProperty } from '../__tests__/utils/helpers';

beforeAll(async () => {
  await testDbManager.init();
});

afterAll(async () => {
  await testDbManager.stop();
});

beforeEach(async () => {
  await testDbManager.clearDatabase();
});

const testTripRequiredProperty = testRequiredProperty(createTrip);

describe('The trip', async () => {
  it('should not be saved without a destination', async () => {
    await testTripRequiredProperty('destination');
  });

  it('should not be saved without a start date', async () => {
    await testTripRequiredProperty('startDate');
  });

  it('should not be saved without an end date', async () => {
    await testTripRequiredProperty('endDate');
  });

  it('should not be saved if it is not assign to an user', async () => {
    await testTripRequiredProperty('user', 'user_id');
  });

  it('should be saved with a creation and update date', async () => {
    const trip = await createTrip();

    expect(trip.createdAt).toBeTruthy();
    expect(trip.createdAt).toBeInstanceOf(Date);
    expect(trip.updatedAt).toEqual(trip.createdAt);
  });

  it('should have its update date updated', async () => {
    const trip = await createTrip();
    const { updatedAt } = trip;
    delete trip.user_id;
    await updateTrip(trip);

    expect(trip.updatedAt).not.toEqual(updatedAt);
  });

  it('should not have its creation date updated', async () => {
    const trip = await createTrip();
    const { createdAt } = trip;

    const testDate = new Date();
    testDate.setMonth((testDate.getMonth() + 1) % 12);

    trip.createdAt = testDate;
    delete trip.user_id;
    const updatedTrip = await updateTrip(trip);

    expect(updatedTrip.createdAt).toEqual(createdAt);
  });

  it('should be saved when is valid', async () => {
    const trip = await createTrip();

    expect(trip.id).toBeTruthy();
  });

  describe('when calculating the days left before it starts', () => {
    it('should return the number of days if it is a future trip', async () => {
      const startDate = moment()
        .startOf('day')
        .add(10, 'days')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(10);
    });

    it('should return null if it is a past trip', async () => {
      const startDate = moment()
        .startOf('day')
        .add(-1, 'days')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(null);
    });

    it('should return zero if the trip starts today', async () => {
      const startDate = moment()
        .startOf('day')
        .toDate();

      const trip = await createTrip({ startDate });

      expect(trip.daysLeft).toEqual(0);
    });
  });
});
