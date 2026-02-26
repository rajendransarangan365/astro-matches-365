import express from 'express';
import { upload, uploadImage, getCloudinaryUsage } from '../controllers/uploadController.js';
import { authenticateToken, isImageAuthorized } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin/Image Authorized only: upload profile image
router.post('/', authenticateToken, isImageAuthorized, upload.single('image'), uploadImage);

// Admin/Image Authorized only: get storage usage
router.get('/usage', authenticateToken, isImageAuthorized, getCloudinaryUsage);

export default router;
