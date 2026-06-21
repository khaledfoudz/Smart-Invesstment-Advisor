import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

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
        debt,
        dependents,
        investment_amount,
        existing_investments,
        investment_objective,
        investment_goal_description,
        horizon,
        risk_tolerance,
        reaction,
        experience,
        liquidity,
        volatility,
        } = req.body;

        await pool.query(
        `
        INSERT INTO questionnaire (
            user_id,
            age,
            occupation,
            location,
            monthly_income,
            current_savings,
            monthly_expenses,
            debt,
            dependents,
            investment_amount,
            existing_investments,
            investment_objective,
            investment_goal_description,
            horizon,
            risk_tolerance,
            reaction,
            experience,
            liquidity,
            volatility
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        ON CONFLICT (user_id) DO UPDATE SET
            age = EXCLUDED.age,
            occupation = EXCLUDED.occupation,
            location = EXCLUDED.location,
            monthly_income = EXCLUDED.monthly_income,
            current_savings = EXCLUDED.current_savings,
            monthly_expenses = EXCLUDED.monthly_expenses,
            debt = EXCLUDED.debt,
            dependents = EXCLUDED.dependents,
            investment_amount = EXCLUDED.investment_amount,
            existing_investments = EXCLUDED.existing_investments,
            investment_objective = EXCLUDED.investment_objective,
            investment_goal_description = EXCLUDED.investment_goal_description,
            horizon = EXCLUDED.horizon,
            risk_tolerance = EXCLUDED.risk_tolerance,
            reaction = EXCLUDED.reaction,
            experience = EXCLUDED.experience,
            liquidity = EXCLUDED.liquidity,
            volatility = EXCLUDED.volatility,
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
            debt,
            dependents,
            investment_amount,
            existing_investments || null,
            investment_objective,
            investment_goal_description || null,
            horizon,
            risk_tolerance,
            reaction,
            experience,
            liquidity,
            volatility,
        ]
        );

        res.status(200).json({ message: "Questionnaire saved successfully" });
    } catch (error) {
        console.error("Questionnaire Submission Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    });

export default router;