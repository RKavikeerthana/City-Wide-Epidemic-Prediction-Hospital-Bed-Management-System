import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
});

const PatientModel = mongoose.model('Patient', patientSchema);

export default PatientModel;
