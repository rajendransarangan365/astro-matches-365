const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் தவறானது' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் இல்லை' });
    }
};

module.exports = { protect };
