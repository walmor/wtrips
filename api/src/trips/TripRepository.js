import Trip from './Trip';

const tripRepository = {
  async insert(tripData) {
    const result = await Trip.query().insertGraph(tripData, { relate: true, noUpdate: ['user'] });
    return this.findById(result.id);
  },

  async update(id, tripData) {
    await Trip.query()
      .patch(tripData)
      .where('id', id);

    return this.findById(id);
  },

  async delete(id) {
    return Trip.query().deleteById(id);
  },

  async findById(id) {
    return Trip.query()
      .joinEager('user')
      .findById(id);
  },

  async list(opts) {
    const query = Trip.query();

    if (opts.userId) {
      query.where('user_id', opts.userId);
    }

    if (opts.search) {
      const search = `LOWER('%${opts.search.toLowerCase()}%')`;

      query.where(function () {
        this.whereRaw(`LOWER(destination) LIKE ${search}`).orWhereRaw(`LOWER(comment) LIKE ${search}`);
      });
    }

    if (opts.startDate) {
      query.andWhere('startDate', '>=', opts.startDate);
    }

    if (opts.endDate) {
      query.andWhere('startDate', '<=', opts.endDate);
    }

    const offset = (opts.page - 1) * opts.pageSize;

    const result = await query.clone().count();
    const totalCount = parseInt(result[0].count, 10);

    const tripModels = await query
      .joinEager('user')
      .limit(opts.pageSize)
      .offset(offset)
      .orderBy(opts.sortField, opts.sortOrder);

    const trips = tripModels.map(t => t.toObject());

    return { totalCount, trips };
  },

  async getTravelPlan(opts) {
    const query = Trip.query().whereBetween('startDate', [opts.startDate, opts.endDate]);

    if (opts.userId) {
      query.andWhere('user_id', opts.userId);
    }

    const tripModels = await query.joinEager('user').orderBy('startDate', 'asc');

    return tripModels.map(t => t.toObject());
  },
};

export default tripRepository;
