import { Model } from 'objection';
import bcrypt from 'bcrypt';
import moment from 'moment';

export default class User extends Model {
  static get tableName() {
    return 'app_user';
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);

    if (this.password) {
      await this.hashPassword();
    }

    this.createdAt = moment().toDate();
    this.updatedAt = this.createdAt;
  }

  async $beforeUpdate(opt, queryContext) {
    // await super.$beforeUpdate(opt, queryContext);

    if (this.password && opt.old && this.password !== opt.old.password) {
      await this.hashPassword();
    }

    delete this.createdAt;

    this.updatedAt = moment().toDate();
  }

  async hashPassword() {
    const saltRounds = 9;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  async comparePassword(password) {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }

  getRoleId() {
    return this.role;
  }

  getResourceId() {
    return 'user';
  }

  toObject() {
    const obj = this.toJSON();
    delete obj.password;
    delete obj.lastIpAddress;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpiresAt;

    return obj;
  }
}
