import express from 'express';
import Alert from '../models/alerts.js';

const alertRouter = express.Router();

// GET /api/alerts            -> only ACTIVE alerts (patient navbar counter)
// GET /api/alerts?all=true   -> every alert, active or not (admin Alerts page)
alertRouter.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const alerts = await Alert.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    res.status(500).json({ success: false, message: 'Unable to fetch alerts' });
  }
});

export default alertRouter;
