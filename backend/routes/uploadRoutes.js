import express from 'express';
import { upload, uploadImage, getCloudinaryUsage } from '../controllers/uploadController.js';
import { authenticateToken, isAIAuthorized } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin/Voice AI only: upload profile image
router.post('/', authenticateToken, isAIAuthorized, upload.single('image'), uploadImage);

// Admin/Voice AI only: get storage usage
router.get('/usage', authenticateToken, isAIAuthorized, getCloudinaryUsage);

export default router;
