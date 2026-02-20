const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'அனைத்து விவரங்களையும் நிரப்பவும்' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'பயனர் தரவு தவறானது' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is set in authMiddleware
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};
