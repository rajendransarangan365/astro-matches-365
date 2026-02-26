import jwt from 'jsonwebtoken';
import { connectToDb } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026');

            // Get user from the token using native MongoDB
            const { usersCollection } = await connectToDb();
            const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });

            if (!user) {
                return res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, பயனர் இல்லை' });
            }

            const { password, ...userWithoutPassword } = user;
            userWithoutPassword.id = user._id.toString();
            userWithoutPassword.isAdmin = user.isAdmin || false;
            userWithoutPassword.canUseVoiceAssistant = user.canUseVoiceAssistant || false;
            req.user = userWithoutPassword;

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் தவறானது' });
        }
    } else {
        res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் இல்லை' });
    }
};

// Alias for protect to match existing route patterns if needed
export const authenticateToken = protect;

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி' });
    }
};

export const isAIAuthorized = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.canUseVoiceAssistant)) {
        next();
    } else {
        res.status(403).json({ message: 'குரல் ஏஐ அனுமதி உள்ளவர்களுக்கு மட்டுமே அனுமதி' });
    }
};
