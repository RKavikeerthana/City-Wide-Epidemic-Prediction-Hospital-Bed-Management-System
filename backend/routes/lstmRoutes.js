// routes/lstmRoutes.js

import express from 'express';
import { trainModel, predictSequence } from '../controllers/lstmController.js';
import { analyzeAdmissions } from '../controllers/analysisController.js';
import authStaff from '../middleware/authStaff.js';

const router = express.Router();

// Route for training the LSTM model
router.post('/train', trainModel);

// Route for making predictions with the LSTM model
router.post('/predict', predictSequence);

// Train on real admission data, forecast, and create alerts (login required)
router.post('/analyze', authStaff, analyzeAdmissions);

export default router;
