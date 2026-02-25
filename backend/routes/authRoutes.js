import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    getUserSecurityDetails,
    getSecurityQuestion,
    verifySecurityAnswer,
    resetPassword,
    updateSecurityDetails
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/security-details', protect, getUserSecurityDetails);
router.put('/update-security', protect, updateSecurityDetails);

// Password Reset Routes
router.get('/forgot-password/question/:identifier', getSecurityQuestion);
router.post('/forgot-password/verify', verifySecurityAnswer);
router.post('/forgot-password/reset', resetPassword);

export default router;
