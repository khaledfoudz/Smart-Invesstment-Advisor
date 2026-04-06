import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml:8000';

// Map ML recommendation string → investment name keywords
const KEYWORD_MAP = {
  stocks:       ['stock'],
  bonds:        ['bond'],
  etf:          ['etf', 'index', 'market'],
  crypto:       ['crypto'],
  'real estate':['real estate', 'reit'],
  'money market':['money market'],
};

function scoreInvestments(recommendation, dbRisk, dbHorizon, investments) {
  const rec = recommendation.toLowerCase();

  return investments
    .map(inv => {
      let score = 0;
      const name = inv.investmentname.toLowerCase();

      // keyword match with ML recommendation
      for (const [key, keywords] of Object.entries(KEYWORD_MAP)) {
        if (rec.includes(key)) {
          if (keywords.some(k => name.includes(k))) score += 50;
        }
      }

      // risk level match
      if (inv.investmentrisk === dbRisk) score += 30;

      // horizon match
      if (inv.investment_horizon.toLowerCase() === dbHorizon.toLowerCase()) score += 20;

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

    // 1. Call ML service
    const mlRes = await fetch(`${ML_SERVICE_URL}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(modelInput),
    });

    if (!mlRes.ok) {
      const err = await mlRes.json();
      return res.status(500).json({ error: 'ML service error', detail: err });
    }

    const { recommendation } = await mlRes.json();

    // 2. Get user's questionnaire answers
    const { rows: qRows } = await pool.query(
      `SELECT answersid, risk_tolerance, investment_horizon
       FROM public.questionnaire WHERE user_id = $1`,
      [userId]
    );

    if (!qRows[0]) {
      return res.status(400).json({ error: 'Complete the questionnaire first' });
    }

    const { answersid, risk_tolerance, investment_horizon } = qRows[0];

    const riskMap    = { conservative: 'Low', balanced: 'Medium', aggressive: 'High' };
    const horizonMap = { short_term: 'Short', medium_term: 'Medium', long_term: 'Long' };
    const dbRisk     = riskMap[risk_tolerance]    || 'Medium';
    const dbHorizon  = horizonMap[investment_horizon] || 'Medium';

    // 3. Get all investments and score them
    const { rows: allInvestments } = await pool.query('SELECT * FROM public.investments');
    let matched = scoreInvestments(recommendation, dbRisk, dbHorizon, allInvestments);

    // Fallback: if nothing matched by keyword, use risk level only
    if (matched.length === 0) {
      matched = allInvestments
        .filter(inv => inv.investmentrisk === dbRisk)
        .map(inv => ({ ...inv, score: 30 + Number(inv.expectedreturn) }))
        .sort((a, b) => b.score - a.score);
    }

    const topMatches  = matched.slice(0, 4);
    const totalScore  = topMatches.reduce((s, m) => s + m.score, 0);

    // 4. Clear old results for this user, insert new ones
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
        investmentname:    match.investmentname,
        investmentrisk:    match.investmentrisk,
        investment_capital: match.investment_capital,
        investment_horizon: match.investment_horizon,
        expectedreturn:    match.expectedreturn,
        confidencescore:   confidenceScore,
        resultsdate:       inserted[0].resultsdate,
      });
    }

    res.json({
      recommendation,
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