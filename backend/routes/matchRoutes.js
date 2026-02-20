import express from 'express';
import { saveMatch, getMatches } from '../controllers/matchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, saveMatch);
router.get('/', authenticate, getMatches);

export default router;
