import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

const TYPE_MAP = {
  'stocks':        ['Stock market', 'Index ETF'],
  'stock market':  ['Stock market', 'Index ETF'],
  'bonds':         ['Bonds', 'Savings'],
  'bond':          ['Bonds', 'Savings'],
  'etf':           ['Index ETF', 'Stock market'],
  'real estate':   ['Real Estate'],
  'reit':          ['Real Estate'],
  'crypto':        ['Crypto'],
  'cryptocurrency':['Crypto'],
  'money market':  ['Money Market', 'Savings'],
  'savings':       ['Savings', 'Money Market'],
  'gold':          ['Commodities'],
  'forex':         ['Forex'],
};

function resolveTypes(recommendation) {
  const lower = (recommendation || '').toLowerCase();
  for (const [key, types] of Object.entries(TYPE_MAP)) {
    if (lower.includes(key)) return types;
  }
  return null;
}

// GET /api/dashboard/investments
router.get('/investments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get questionnaire risk + horizon
    const { rows: qRows } = await pool.query(
      `SELECT risk_tolerance, investment_horizon
       FROM public.questionnaire WHERE user_id = $1`,
      [userId]
    );

    // Get latest ML recommendation
    const { rows: rRows } = await pool.query(
      `SELECT recommendation_text, resultsdate
       FROM public.results
       WHERE userid = $1
       ORDER BY resultsdate DESC LIMIT 1`,
      [userId]
    );

    if (!qRows[0]) {
      return res.json({ investments: [], recommendation: null, hasQuestionnaire: false });
    }

    const riskMap    = { conservative: 'Low', balanced: 'Medium', aggressive: 'High' };
    const horizonMap = { short_term: 'Short', medium_term: 'Medium', long_term: 'Long' };
    const dbRisk     = riskMap[qRows[0].risk_tolerance]       || 'Medium';
    const dbHorizon  = horizonMap[qRows[0].investment_horizon] || 'Medium';
    const recommendation = rRows[0]?.recommendation_text || null;
    const lastUpdated    = rRows[0]?.resultsdate || null;

    const matchedTypes = recommendation ? resolveTypes(recommendation) : null;

    let investments = [];

    if (matchedTypes) {
      // Primary: match type + risk
      const { rows } = await pool.query(
        `SELECT * FROM public.investments
         WHERE investment_type = ANY($1)
           AND investmentrisk = $2
         ORDER BY expectedreturn DESC`,
        [matchedTypes, dbRisk]
      );
      investments = rows;

      // Supplement: if fewer than 3 results, add same-risk different types
      if (investments.length < 3) {
        const existingIds = investments.map(i => i.investmentId);
        const { rows: extra } = await pool.query(
          `SELECT * FROM public.investments
           WHERE investmentrisk = $1
             AND "investmentId" != ALL($2)
           ORDER BY expectedreturn DESC
           LIMIT $3`,
          [dbRisk, existingIds.length ? existingIds : [0], 3 - investments.length]
        );
        investments = [...investments, ...extra];
      }
    } else {
      // No recommendation yet — show all investments matching risk
      const { rows } = await pool.query(
        `SELECT * FROM public.investments
         WHERE investmentrisk = $1
         ORDER BY expectedreturn DESC`,
        [dbRisk]
      );
      investments = rows;
    }

    res.json({
      hasQuestionnaire: true,
      recommendation,
      lastUpdated,
      dbRisk,
      dbHorizon,
      riskTolerance:     qRows[0].risk_tolerance,
      investmentHorizon: qRows[0].investment_horizon,
      investments,
    });

  } catch (err) {
    console.error('Dashboard investments error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

export default router;