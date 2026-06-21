import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml:8000';

// horizon is years (2–15), bucket it the same way the investments table does
function mapHorizon(years) {
  const n = Number(years);
  if (n <= 3) return 'Short';
  if (n <= 7) return 'Medium';
  return 'Long';
}

// The ML service now returns specific instrument names (e.g. "EGX30 Index Fund")
// pulled from the historical dataset, which won't match 1:1 against our
// investments table's names (e.g. "EGX30 Blue Chip Stocks"). Match on keywords
// instead of exact strings.
function buildKeywords(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3); // skip short filler words like "of", "the"
}

function scoreInvestments(investmentNames, dbRisk, investments) {
  const allKeywords = investmentNames.flatMap(buildKeywords);

  return investments
    .map(inv => {
      let score = 0;
      const name = inv.investmentname.toLowerCase();

      for (const kw of allKeywords) {
        if (name.includes(kw)) score += 40;
      }

      if (inv.investmentrisk === dbRisk) score += 30;

      return { ...inv, score };
    })
    .filter(inv => inv.score > 0)
    .sort((a, b) => b.score - a.score);
}

// POST /api/recommendations/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { modelInput } = req.body;

    if (!modelInput) {
      return res.status(400).json({ error: 'modelInput is required' });
    }

    // 1. Call ML service — it now classifies risk itself
    const mlRes = await fetch(`${ML_SERVICE_URL}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(modelInput),
    });

    if (!mlRes.ok) {
      const err = await mlRes.json();
      return res.status(500).json({ error: 'ML service error', detail: err });
    }

    const {
      recommendation,
      investor_profile,
      dbRisk,
      confidence,
      other_options = [],
    } = await mlRes.json();

    const dbHorizon = mapHorizon(modelInput.horizon);

    // 2. Get user's questionnaire row (just need answersid)
    const { rows: qRows } = await pool.query(
      `SELECT answersid FROM public.questionnaire WHERE user_id = $1`,
      [userId]
    );

    if (!qRows[0]) {
      return res.status(400).json({ error: 'Complete the questionnaire first' });
    }

    const { answersid } = qRows[0];

    // 3. Match the ML model's recommended instrument(s) to our investments table
    const { rows: allInvestments } = await pool.query('SELECT * FROM public.investments');
    let matched = scoreInvestments([recommendation, ...other_options], dbRisk, allInvestments);

    // Fallback: nothing matched by name, use risk level only
    if (matched.length === 0) {
      matched = allInvestments
        .filter(inv => inv.investmentrisk === dbRisk)
        .map(inv => ({ ...inv, score: 30 + Number(inv.expectedreturn) }))
        .sort((a, b) => b.score - a.score);
    }

    const topMatches = matched.slice(0, 4);
    const totalScore = topMatches.reduce((s, m) => s + m.score, 0);

    // 4. Clear old results, insert new ones
    await pool.query('DELETE FROM public.results WHERE userid = $1', [userId]);

    const savedInvestments = [];

    for (const match of topMatches) {
      const confidenceScore = totalScore > 0
        ? parseFloat((match.score / totalScore).toFixed(4))
        : parseFloat((1 / topMatches.length).toFixed(4));

      const { rows: inserted } = await pool.query(
        `INSERT INTO public.results (investmentid, userid, answersid, confidencescore)
         VALUES ($1, $2, $3, $4) RETURNING resultsdate`,
        [match.investmentId, userId, answersid, confidenceScore]
      );

      savedInvestments.push({
        investmentname:     match.investmentname,
        investmentrisk:     match.investmentrisk,
        investment_capital: match.investment_capital,
        investment_horizon: match.investment_horizon,
        expectedreturn:     match.expectedreturn,
        confidencescore:    confidenceScore,
        resultsdate:        inserted[0].resultsdate,
      });
    }

    res.json({
      recommendation,
      investorProfile: investor_profile,
      confidence,
      dbRisk,
      dbHorizon,
      investments: savedInvestments,
    });

  } catch (err) {
    console.error('Recommendations generate error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;