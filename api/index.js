import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../backend/routes/authRoutes.js';
import matchRoutes from '../backend/routes/matchRoutes.js';
import profileRoutes from '../backend/routes/profileRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/profiles', profileRoutes);

// Export for Vercel
export default app;
