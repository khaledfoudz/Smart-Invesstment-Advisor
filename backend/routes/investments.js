import express from 'express';
import {pool} from '../db.js';

const router = express.Router();

//get all investments
router.get('/investments', async (req, res) => {
    
    try{
        const result =  await pool.query('SELECT * FROM investments');
        res.status(200).json(result.rows);
    }
    catch(error){
        res.status(500).json({message: 'Internal server error'});
    }
});

export default router;