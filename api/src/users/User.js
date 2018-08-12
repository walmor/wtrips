import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';
import isIP from 'validator/lib/isIP';
import moment from 'moment';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    index: true,
    required: true,
    lowercase: true,
    validate: {
      validator: isEmail,
      message: 'Invalid email.',
    },
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'manager', 'admin'] },
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    set(val) {
      return this.createdAt || val;
    },
  },
  updatedAt: Date,
  lastIPAddress: {
    type: String,
    required: true,
    validate: {
      validator: val => isIP(val),
      message: 'Invalid IP address.',
    },
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
});

userSchema.set('toObject', {
  versionKey: false,
  transform(doc, ret) {
    delete ret.password;
    delete ret.lastIPAddress;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiresAt;

    return ret;
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const saltRounds = 9;
    if (this.password) {
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  const now = moment().toDate();

  if (this.isNew) {
    this.createdAt = now;
  }

  this.updatedAt = now;

  next();
});

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getRoleId = function () {
  return this.role;
};

userSchema.methods.getResourceId = function () {
  return 'user';
};

const User = mongoose.model('User', userSchema);

export default User;
