import express from 'express';
import { saveProfile, getProfiles } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, saveProfile);
router.get('/', protect, getProfiles);

export default router;
