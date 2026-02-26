import express from 'express';
import { askAstrologer } from '../controllers/chatController.js';

const router = express.Router();

// Ask astrologer
router.post('/', askAstrologer);

export default router;
