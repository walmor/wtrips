import User from '../../users/User';
import Trip from '../../trips/Trip';

async function createUser(props) {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    password: '123456',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastIPAddress: '189.100.242.238',
  };

  return Promise.resolve(new User(Object.assign(user, props)));
}

async function createTrip(props) {
  const user = await createUser();
  await user.save();

  const trip = {
    destination: 'New Zealand',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-02-01'),
    comment: 'This is going to be an awesome trip.',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: user.id,
  };

  return new Trip(Object.assign(trip, props));
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

export { createUser, createTrip, testRequiredProperty };
