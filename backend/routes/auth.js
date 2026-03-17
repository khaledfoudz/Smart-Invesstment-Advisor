import express from 'express';
import bcryptjs from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken'; 

const router = express.Router();

//signup
router.post('/signup',
    [
        body('name').not().isEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ]

    , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //check if email already exists
    try{
        const {email} = req.body;
        const existingUser = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if(existingUser.rows.length > 0){
            return res.status(400).json({message: 'Email already in use'});
        }
    }
    catch(error){
        return res.status(500).json({message: 'Internal server error'});
    }


    try{ 
        //hash password 
        const hashedPassword = await bcryptjs.hash(req.body.password, 8);
        //add user to database
        const {name,email} = req.body;
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', 
            [name, email, hashedPassword]
        );
        const user = newUser.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
 
        res.status(200).json({ token, user });

    }
   catch(error){
    console.error("Signup Error:", error); 
    res.status(500).json({message: 'Internal server error'});
}

});


//login
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try{
        const userQuery = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if(userQuery.rows.length === 0){
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const user = userQuery.rows[0];

        const validPassword = await bcryptjs.compare(password, user.password);
        if(!validPassword){
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // ✅ Generate JWT token بعد تسجيل الدخول
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // ✅ رجع token + user عشان الفرونت ايند يستخدمهم
        res.status(200).json({ token, user });
    }
    catch(error){
        res.status(500).json({message: 'Internal server error'});
    }
});

// ===== Auth Middleware =====
// ✅ الحماية لأي route محمي
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ ضيف بيانات المستخدم لل request
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default router;

