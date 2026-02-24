import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// Get all questionnaires for the authenticated user
router.post('/questionnaire', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

    const {
    age,
    occupation,
    location,
    monthly_income,
    current_savings,
    monthly_expenses,
    existing_investments,
    investment_objective,
    investment_goal_description,
    investment_horizon,
    risk_tolerance,
    risk_reaction,
    } = req.body;

    await pool.query(
        `
        INSERT INTO questionnaire
        (user_id, age, occupation, location, monthly_income, current_savings, monthly_expenses,
        existing_investments, investment_objective, investment_goal_description,
        investment_horizon, risk_tolerance, risk_reaction)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (user_id) DO UPDATE SET
        age = EXCLUDED.age,
        occupation = EXCLUDED.occupation,
        location = EXCLUDED.location,
        monthly_income = EXCLUDED.monthly_income,
        current_savings = EXCLUDED.current_savings,
        monthly_expenses = EXCLUDED.monthly_expenses,
        existing_investments = EXCLUDED.existing_investments,
        investment_objective = EXCLUDED.investment_objective,
        investment_goal_description = EXCLUDED.investment_goal_description,
        investment_horizon = EXCLUDED.investment_horizon,
        risk_tolerance = EXCLUDED.risk_tolerance,
        risk_reaction = EXCLUDED.risk_reaction,
        created_at = NOW()
        `,
        [
        userId,
        age,
        occupation,
        location || null,
        monthly_income,
        current_savings,
        monthly_expenses,
        existing_investments || null,
        investment_objective,
        investment_goal_description || null,
        investment_horizon,
        risk_tolerance,
        risk_reaction,
        ]
    );

    res.status(200).json({ message: "Questionnaire saved (insert/update)" });

    }catch (error) {
        console.error("Questionnaire Submission Error:", error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
        }
});

export default router;