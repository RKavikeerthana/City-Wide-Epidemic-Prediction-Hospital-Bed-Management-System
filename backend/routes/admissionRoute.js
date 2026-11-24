import express from 'express';
import authStaff from '../middleware/authStaff.js';
import { addAdmission, listAdmissions, loadSampleData, clearSampleData } from '../controllers/admissionController.js';

const admissionRouter = express.Router();

admissionRouter.get('/', authStaff, listAdmissions);
admissionRouter.post('/', authStaff, addAdmission);
admissionRouter.post('/sample', authStaff, loadSampleData);
admissionRouter.delete('/sample', authStaff, clearSampleData);

export default admissionRouter;
