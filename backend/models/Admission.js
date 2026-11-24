import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  admissionReason: { type: String, required: true, trim: true }, // disease / condition
  region: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },                   // admission date
  isSample: { type: Boolean, default: false },                    // true = demo data
});

admissionSchema.index({ createdAt: -1 });

export default mongoose.models.Admission || mongoose.model('Admission', admissionSchema);
