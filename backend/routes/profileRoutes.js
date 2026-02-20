import express from 'express';
import { saveProfile, getProfiles } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, saveProfile);
router.get('/', authenticate, getProfiles);

export default router;
