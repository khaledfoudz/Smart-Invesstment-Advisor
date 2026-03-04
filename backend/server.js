import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import investmentRoutes from './routes/investments.js';
import authRoutes from './routes/auth.js';
import questionnaireRoutes from './routes/questionnaire.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES
app.use(cors({
  origin: process.env.FRONTEND_URL, // vite port
  credentials: true
}));

app.use(express.json());

// ROUTES
app.use('/api', investmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', questionnaireRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
