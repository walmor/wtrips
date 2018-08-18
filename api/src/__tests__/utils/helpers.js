import casual from 'casual';
import moment from 'moment';
import User from '../../users/User';
import Trip from '../../trips/Trip';

async function createUser(props) {
  const user = {
    name: casual.full_name,
    email: casual.email,
    role: 'user',
    password: '123456',
    isActive: true,
    lastIPAddress: '189.100.242.238',
  };

  return Promise.resolve(new User(Object.assign(user, props)));
}

async function createUsers(qty) {
  const users = [];

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < qty; i++) {
    const user = await createUser();
    await user.save();
    users.push(user);
  }

  return users;
}

async function createTrip(props) {
  let user = null;

  if (props) {
    ({ user } = props);
  }

  if (!user) {
    user = await createUser();
    await user.save();
  }

  const trip = {
    destination: 'New Zealand',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-02-01'),
    comment: casual.short_description,
    user: user.id,
  };

  return new Trip(Object.assign(trip, props));
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

  return Promise.all(trips.map(async trip => (await createTrip(trip)).save()));
}

function testRequiredProperty(createModel) {
  return async (propName) => {
    expect.assertions(2);

    const model = await createModel({ [propName]: null });

    try {
      await model.save();
    } catch (error) {
      expect(error.errors[propName]).toBeDefined();
      expect(error.errors[propName].kind).toBe('required');
    }
  };
}

export {
  createUser, createUsers, createTrip, createTrips, testRequiredProperty,
};
