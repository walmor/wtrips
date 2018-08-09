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

const User = mongoose.model('User', userSchema);

export default User;
