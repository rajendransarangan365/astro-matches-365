import express from 'express';
import { upload, uploadImage, getCloudinaryUsage } from '../controllers/uploadController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only: upload profile image
router.post('/', authenticateToken, isAdmin, upload.single('image'), uploadImage);

// Admin only: get storage usage
router.get('/usage', authenticateToken, isAdmin, getCloudinaryUsage);

export default router;
