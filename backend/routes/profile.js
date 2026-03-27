import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: profileRows } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        q.answersid,
        q.age,
        q.occupation,
        q.location,
        q.monthly_income,
        q.current_savings,
        q.monthly_expenses,
        q.existing_investments,
        q.investment_objective,
        q.investment_goal_description,
        q.investment_horizon,
        q.risk_tolerance,
        q.risk_reaction,
        q.created_at AS questionnaire_completed_at
      FROM public.users u
      LEFT JOIN public.questionnaire q ON u.id = q.user_id
      WHERE u.id = $1
    `, [userId]);

    if (!profileRows[0]) return res.status(404).json({ error: 'User not found' });

    const { rows: resultsRows } = await pool.query(`
      SELECT
        i.investmentname,
        i.investmentrisk,
        i.investment_capital,
        i.investment_horizon,
        i.expectedreturn,
        r.confidencescore,
        r.resultsdate
      FROM public.results r
      JOIN public.investments i ON r.investmentid = i."investmentId"
      WHERE r.userid = $1
      ORDER BY r.confidencescore DESC
    `, [userId]);

    res.json({ ...profileRows[0], recommendations: resultsRows });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (name) {
      await pool.query(
        'UPDATE public.users SET name = $1 WHERE id = $2',
        [name.trim(), userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;