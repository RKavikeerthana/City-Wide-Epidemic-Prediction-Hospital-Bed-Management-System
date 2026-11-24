import Admission from '../models/Admission.js';
import Alert from '../models/alerts.js';
import { trainLSTMModel, predictLSTMBatch } from '../models/LSTMModel.js';

const SEQ_LEN = 10;            // the LSTM looks at 10 days
const MAX_DAYS = 60;           // use at most the last 60 days of history
const DEFAULT_THRESHOLD = 5;   // admissions/day that counts as an alert
const EPOCHS = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

let running = false;

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const dayIndex = (key) => Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS);
const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const round1 = (n) => Math.round(n * 10) / 10;

// POST /api/ml/analyze   { threshold?: number }
// 1. counts admissions per day for each (region, condition)
// 2. trains the LSTM on those daily counts
// 3. forecasts tomorrow's admissions for each (region, condition)
// 4. creates / updates Alert records
export const analyzeAdmissions = async (req, res) => {
  if (running) {
    return res.status(409).json({ success: false, message: 'Analysis is already running. Please wait.' });
  }
  running = true;

  try {
    const parsed = Number(req.body?.threshold);
    const threshold = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD;

    const raw = await Admission.find({}, 'region admissionReason createdAt').lean();
    if (raw.length === 0) {
      return res.json({ success: false, message: 'No admission records yet. Add admissions or load sample data first.' });
    }

    const todayIdx = dayIndex(dayKey(Date.now()));
    const records = raw
      .filter((a) => a.region && a.admissionReason && a.createdAt)
      .map((a) => ({
        region: a.region.trim(),
        reason: a.admissionReason.trim(),
        idx: dayIndex(dayKey(a.createdAt)),
      }))
      .filter((a) => a.region && a.reason && a.idx <= todayIdx);

    if (records.length === 0) {
      return res.json({ success: false, message: 'No usable admission records found.' });
    }

    const earliest = records.reduce((m, a) => Math.min(m, a.idx), Infinity);
    const days = Math.min(MAX_DAYS, todayIdx - earliest + 1);
    const minDays = SEQ_LEN + 2;
    if (days < minDays) {
      return res.json({
        success: false,
        message: `Need at least ${minDays} days of admission history; found ${days}. Use "Load sample data" on the Admissions page to try the demo.`,
      });
    }
    const startIdx = todayIdx - days + 1;

    // Daily counts per (region, condition)
    const groups = new Map();
    for (const a of records) {
      if (a.idx < startIdx) continue;
      const key = `${a.region.toLowerCase()}|${a.reason.toLowerCase()}`;
      let g = groups.get(key);
      if (!g) {
        g = { region: a.region, condition: a.reason, series: new Array(days).fill(0) };
        groups.set(key, g);
      }
      g.series[a.idx - startIdx] += 1;
    }
    const list = [...groups.values()];

    // Scale values into 0..1 (the model ends in a sigmoid); headroom lets it forecast a bit above past peaks
    let maxVal = 1;
    for (const g of list) for (const v of g.series) if (v > maxVal) maxVal = v;
    const scale = maxVal * 1.25;

    // Sliding windows: 10 days in -> next day out
    const inputs = [];
    const outputs = [];
    for (const g of list) {
      for (let t = SEQ_LEN; t < days; t++) {
        inputs.push(g.series.slice(t - SEQ_LEN, t).map((v) => v / scale));
        outputs.push(g.series[t] / scale);
      }
    }

    await trainLSTMModel({ inputs, outputs, epochs: EPOCHS });

    const forecasts = await predictLSTMBatch(
      list.map((g) => g.series.slice(-SEQ_LEN).map((v) => v / scale))
    );

    const results = list.map((g, i) => {
      const predicted = Math.max(0, forecasts[i] * scale);
      const recentAverage = mean(g.series.slice(-7));
      const last3Average = mean(g.series.slice(-3));

      let trigger = null;
      if (predicted >= threshold) trigger = 'forecast';
      else if (last3Average >= threshold) trigger = 'current';

      return {
        region: g.region,
        condition: g.condition,
        totalAdmissions: g.series.reduce((s, v) => s + v, 0),
        recentAverage: round1(recentAverage),
        predicted: round1(predicted),
        alert: trigger !== null,
        trigger,
      };
    });

    // Save alerts: deactivate old ones, then create / refresh the triggered ones
    await Alert.updateMany({}, { $set: { active: false } });
    for (const r of results.filter((x) => x.alert)) {
      await Alert.findOneAndUpdate(
        { region: r.region, admissionReason: r.condition },
        {
          $set: {
            count: Math.round(r.predicted),
            predictedCount: r.predicted,
            recentAverage: r.recentAverage,
            trigger: r.trigger,
            active: true,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    results.sort((a, b) => b.predicted - a.predicted);

    res.json({
      success: true,
      message: `Analysis complete. ${results.filter((r) => r.alert).length} alert(s) active.`,
      summary: {
        admissionsAnalyzed: records.length,
        daysOfHistory: days,
        groups: list.length,
        trainingSamples: inputs.length,
        epochs: EPOCHS,
        threshold,
      },
      results,
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ success: false, message: `Analysis failed: ${error.message}` });
  } finally {
    running = false;
  }
};
