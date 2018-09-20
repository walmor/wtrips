import User from './User';

const userRepository = {
  async insert(userData) {
    return User.query().insertGraph(userData);
  },

  async update(id, userData) {
    return User.query().patchAndFetchById(id, userData);
  },

  async findById(id) {
    return User.query().findById(id);
  },

  async findByEmail(email) {
    return User.query().findOne({ email });
  },

  async isEmailAvailable(email, id) {
    const query = User.query().where('email', email);

    if (id) {
      query.andWhere('id', '<>', id);
    }

    const result = await query.count();

    return !parseInt(result[0].count, 10);
  },

  async list(opts) {
    const skip = (opts.page - 1) * opts.pageSize;

    const query = User.query();

    if (opts.search) {
      const search = `LOWER('%${opts.search.toLowerCase()}%')`;

      query.where(function () {
        this.whereRaw(`LOWER(name) LIKE ${search}`).orWhereRaw(`LOWER(email) LIKE ${search}`);
      });
    }

    if (opts.isActive !== null) {
      query.andWhere({ isActive: opts.isActive });
    }

    if (opts.isManager) {
      query.andWhere('role', '<>', 'admin');
    }

    const result = await query.clone().count();
    const totalCount = parseInt(result[0].count, 10);

    const userModels = await query
      .limit(opts.pageSize)
      .offset(skip)
      .orderBy('createdAt', 'desc');

    const users = userModels.map(u => u.toObject());

    return {
      totalCount,
      users,
    };
  },
};

export default userRepository;
