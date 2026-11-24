import express from 'express';
const patientRouter = express.Router();
import PatientModel from '../models/patient.js'; // Ensure the correct import

// Fetch all patients
patientRouter.get('/', async (req, res) => {
  try {
    const patients = await PatientModel.find();
    res.json(patients); // Return the patient data
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch patient data' });
  }
});

export default patientRouter;
