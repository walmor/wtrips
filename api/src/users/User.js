import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';
import isIP from 'validator/lib/isIP';

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
    required: true,
    set(val) {
      return this.createdAt || val;
    },
  },
  updatedAt: { type: Date, required: true },
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

userSchema.path('email').validate({
  message: 'This email is already in use by another account.',
  validator(value) {
    let where = { email: value };

    if (!this.isNew) {
      where = {
        $and: [where, { _id: { $ne: this._id } }],
      };
    }

    return new Promise((resolve, reject) => {
      this.model('User').countDocuments(where, (err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(!count);
        }
      });
    });
  },
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
