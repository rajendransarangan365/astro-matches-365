import express from 'express';
import { saveMatch, getMatches } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, saveMatch);
router.get('/', protect, getMatches);

export default router;
