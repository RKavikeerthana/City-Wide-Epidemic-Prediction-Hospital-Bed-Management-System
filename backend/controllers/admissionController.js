import Admission from '../models/Admission.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// POST /api/admissions
export const addAdmission = async (req, res) => {
  try {
    const patientName = String(req.body.patientName || '').trim();
    const admissionReason = String(req.body.admissionReason || '').trim();
    const region = String(req.body.region || '').trim();
    const admissionDate = req.body.admissionDate;

    if (!patientName || !admissionReason || !region) {
      return res.json({ success: false, message: 'Patient name, condition and region are required' });
    }
    if (patientName.length > 100 || admissionReason.length > 100 || region.length > 100) {
      return res.json({ success: false, message: 'Each field must be 100 characters or fewer' });
    }

    let createdAt = new Date();
    if (admissionDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(admissionDate)) {
        return res.json({ success: false, message: 'Date must look like YYYY-MM-DD' });
      }
      createdAt = new Date(`${admissionDate}T12:00:00.000Z`);
      if (Number.isNaN(createdAt.getTime())) {
        return res.json({ success: false, message: 'Invalid date' });
      }
      if (createdAt.getTime() > Date.now() + DAY_MS) {
        return res.json({ success: false, message: 'Admission date cannot be in the future' });
      }
    }

    await Admission.create({ patientName, admissionReason, region, createdAt });
    res.json({ success: true, message: 'Admission recorded' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/admissions  -> latest 50 + totals
export const listAdmissions = async (req, res) => {
  try {
    const [admissions, total, sampleCount] = await Promise.all([
      Admission.find({}).sort({ createdAt: -1 }).limit(50).lean(),
      Admission.countDocuments({}),
      Admission.countDocuments({ isSample: true }),
    ]);
    res.json({ success: true, admissions, total, sampleCount });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Small deterministic random generator so the demo data is the same every time
const makeRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

// POST /api/admissions/sample  -> 40 days of demo admissions
export const loadSampleData = async (req, res) => {
  try {
    const DAYS = 40;
    const rand = makeRandom(42);
    const noise = () => Math.floor(rand() * 3) - 1; // -1, 0, +1

    // [region, condition, function(dayNumber 0..DAYS-1) -> admissions that day]
    const profiles = [
      // Rising outbreak: ~1/day growing to ~9/day
      ['Chennai', 'Dengue', (d) => 1 + Math.round(Math.pow(d / (DAYS - 1), 2) * 8) + noise()],
      // Steady moderate
      ['Madurai', 'Influenza', () => 3 + noise()],
      // Low and steady
      ['Coimbatore', 'Typhoid', () => 1 + (rand() < 0.5 ? 1 : 0)],
      ['Chennai', 'Influenza', () => 1 + (rand() < 0.4 ? 1 : 0)],
    ];

    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const docs = [];
    let n = 1;
    for (let d = 0; d < DAYS; d++) {
      const dayStart = todayUTC - (DAYS - 1 - d) * DAY_MS;
      for (const [region, admissionReason, fn] of profiles) {
        const count = Math.max(0, fn(d));
        for (let i = 0; i < count; i++) {
          docs.push({
            patientName: `Sample Patient ${n++}`,
            admissionReason,
            region,
            createdAt: new Date(dayStart + 12 * 60 * 60 * 1000),
            isSample: true,
          });
        }
      }
    }

    await Admission.deleteMany({ isSample: true }); // avoid duplicates on repeat clicks
    await Admission.insertMany(docs);
    res.json({ success: true, message: `Loaded ${docs.length} sample admissions (${DAYS} days)` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/admissions/sample  -> removes only demo records
export const clearSampleData = async (req, res) => {
  try {
    const result = await Admission.deleteMany({ isSample: true });
    res.json({ success: true, message: `Removed ${result.deletedCount} sample admissions` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
