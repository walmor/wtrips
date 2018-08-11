import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

const tripSchema = new Schema({
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  comment: String,
  createdAt: {
    type: Date,
    required: true,
    set(val) {
      return this.createdAt || val;
    },
  },
  updatedAt: { type: Date, required: true },
});

tripSchema.virtual('daysLeft').get(function () {
  const today = moment.utc().startOf('day');
  const startDate = moment.utc(this.startDate);

  const diff = startDate.diff(today, 'days');

  return diff >= 0 ? diff : null;
});

tripSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret.id;
    return ret;
  },
});

tripSchema.methods.getResourceId = function () {
  return 'trip';
};

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
