import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

const tripSchema = new Schema({
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
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
  const today = moment().startOf('day');
  const startDate = moment(this.startDate);

  const diff = startDate.diff(today, 'days');

  return diff >= 0 ? diff : null;
});

tripSchema.methods.getResourceId = function () {
  return 'trip';
};

tripSchema.set('toObject', { virtuals: true });
tripSchema.set('toJSON', { virtuals: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
