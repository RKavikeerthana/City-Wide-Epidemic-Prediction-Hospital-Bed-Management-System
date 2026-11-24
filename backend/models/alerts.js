import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  admissionReason: String,
  region: String,
  count: Number,                       // predicted admissions for the next day (rounded)
  predictedCount: Number,              // same, unrounded
  recentAverage: Number,               // average admissions/day over the last 7 days
  trigger: String,                     // 'forecast' or 'current'
  active: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
