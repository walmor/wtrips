import { Model } from 'objection';
import moment from 'moment';
import User from '../users/User';

export default class Trip extends Model {
  static get tableName() {
    return 'trip';
  }

  static get virtualAttributes() {
    return ['daysLeft'];
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        filter: query => query.select('id', 'name'),
        join: {
          from: 'trip.user_id',
          to: 'app_user.id',
        },
      },
    };
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);

    this.createdAt = moment().toDate();
    this.updatedAt = this.createdAt;
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);

    delete this.createdAt;

    this.updatedAt = moment().toDate();
  }

  getResourceId() {
    return 'trip';
  }

  toObject() {
    const obj = this.toJSON();
    delete obj.userId;
    return obj;
  }

  get daysLeft() {
    const today = moment().startOf('day');
    const startDate = moment(this.startDate);

    const diff = startDate.diff(today, 'days');

    return diff >= 0 ? diff : null;
  }
}
