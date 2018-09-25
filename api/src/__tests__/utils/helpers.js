import casual from 'casual';
import moment from 'moment';
import { snakeCase } from 'objection/lib/utils/identifierMapping';
import userRepository from '../../users/UserRepository';
import tripRepository from '../../trips/TripRepository';

async function createUser(props) {
  const user = {
    name: casual.full_name,
    email: casual.email,
    role: 'user',
    password: '123456',
    isActive: true,
    lastIpAddress: '189.100.242.238',
  };

  return userRepository.insert(Object.assign(user, props));
}

async function createUsers(qty) {
  const users = [];

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < qty; i++) {
    const user = await createUser();
    users.push(user);
  }

  return users;
}

async function updateUser(user) {
  return userRepository.update(user.id, user);
}

async function createTrip(props) {
  let user = null;

  if (props) {
    ({ user } = props);
  }

  if (!user) {
    user = await createUser();
  }

  const trip = {
    destination: 'New Zealand',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-02-01'),
    comment: casual.short_description,
    user,
  };

  return tripRepository.insert(Object.assign(trip, props));
}

async function createTrips(qty, user) {
  const trips = [];

  for (let i = 0; i < qty; i++) {
    const destination = casual.country;
    const comment = casual.short_description;
    const date = moment()
      .startOf('day')
      .add(casual.integer(-10, 100), 'days');
    const startDate = date.toDate();
    const endDate = date.add(casual.integer(1, 20), 'days').toDate();

    const tripData = {
      destination,
      startDate,
      endDate,
      comment,
      user,
    };

    trips.push(tripData);
  }

  return Promise.all(trips.map(async trip => createTrip(trip)));
}

async function updateTrip(trip) {
  return tripRepository.update(trip.id, trip);
}

function testRequiredProperty(createModel) {
  return async (propName, columnName) => {
    expect.assertions(2);

    try {
      await createModel({ [propName]: null });
    } catch (error) {
      const cn = columnName || snakeCase(propName);
      expect(error.column).toEqual(cn);
      expect(error.code).toEqual('23502');
    }
  };
}

export {
  createUser, createUsers, updateUser, createTrip, createTrips, updateTrip, testRequiredProperty,
};
