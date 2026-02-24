import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

// Logout route
router.post('/logout', (req, res) => {
    // Clear the authentication token (if using cookies, clear the cookie)
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
}
);

export default router;