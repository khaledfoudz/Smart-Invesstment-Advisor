import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://ml:8000";

router.post('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId      = req.user.id;
    const { modelInput } = req.body;

    // 1 — call ML model
    const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(modelInput),
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.json();
      return res.status(502).json({ message: 'ML service error', detail: err });
    }

    const { recommendation } = await mlResponse.json();

    // 2 — get user's answersid
    const questionnaireResult = await pool.query(
      `SELECT answersid FROM questionnaire WHERE user_id = $1`,
      [userId]
    );
    const answersid = questionnaireResult.rows[0]?.answersid;

    if (!answersid) {
      return res.status(400).json({ message: 'Questionnaire not found for this user' });
    }

    // 3 — mark previous results as not current
    await pool.query(
      `UPDATE results SET is_current = false WHERE userid = $1`,
      [userId]
    );

    // 4 — save recommendation as-is
    await pool.query(
      `INSERT INTO results (userid, answersid, recommendation_text, is_current)
       VALUES ($1, $2, $3, true)`,
      [userId, answersid, recommendation]
    );

    // 5 — fetch all matching investments of this type for the dashboard
    const investments = await pool.query(
      `SELECT * FROM investments WHERE investment_type = $1`,
      [recommendation]
    );

    res.json({
      recommendation,
      investments: investments.rows,
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;