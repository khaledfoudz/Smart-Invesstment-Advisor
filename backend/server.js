import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import investmentRoutes from './routes/investments.js';
import authRoutes from './routes/auth.js';
import questionnaireRoutes from './routes/questionnaire.js';
import marketRoutes from './routes/market.js';
import predictRouter from './routes/predict.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// ROUTES
app.use('/api', investmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', questionnaireRoutes);
app.use('/api/market', marketRoutes);
app.use('/api', predictRouter);

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});