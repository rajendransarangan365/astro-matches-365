import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './backend/routes/authRoutes.js';
import matchRoutes from './backend/routes/matchRoutes.js';
import profileRoutes from './backend/routes/profileRoutes.js';
import chatRoutes from './backend/routes/chatRoutes.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main entry point for local server execution. Note that the DB connection runs lazily inside controllers.
// The routes simply point to the controllers.

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/chat', chatRoutes);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
