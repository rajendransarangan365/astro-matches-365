import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDb } from '../config/db.js';
import { ObjectId } from 'mongodb';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, mobile, password, securityQuestion, securityAnswer } = req.body;

        if (!name || !email || !mobile || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: 'அனைத்து விவரங்களையும் நிரப்பவும்' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' });
        }

        const { usersCollection } = await connectToDb();

        const userExists = await usersCollection.findOne({
            $or: [{ email: email.toLowerCase().trim() }, { mobile: mobile.trim() }]
        });

        if (userExists) {
            if (userExists.email === email.toLowerCase().trim()) {
                return res.status(400).json({ message: 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது' });
            }
            if (userExists.mobile === mobile.trim()) {
                return res.status(400).json({ message: 'இந்த கைபேசி எண் ஏற்கனவே பயன்பாட்டில் உள்ளது' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await usersCollection.insertOne({
            name,
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            password: hashedPassword,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim(),
            createdAt: new Date()
        });

        if (result.insertedId) {
            res.status(201).json({
                _id: result.insertedId,
                name,
                email: email.toLowerCase().trim(),
                mobile: mobile.trim(),
                token: generateToken(result.insertedId)
            });
        } else {
            res.status(400).json({ message: 'பயனர் தரவு தவறானது' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { usersCollection } = await connectToDb();
        const user = await usersCollection.findOne({ email: email?.toLowerCase()?.trim() });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
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

export const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

export const getUserSecurityDetails = async (req, res) => {
    try {
        const { usersCollection } = await connectToDb();
        const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });

        if (!user) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை' });
        }

        res.json({ securityQuestion: user.securityQuestion || '' });
    } catch (error) {
        res.status(500).json({ message: 'சேவையக பிழை' });
    }
};

export const verifyCurrentPassword = async (req, res) => {
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) {
            return res.status(400).json({ message: 'கடவுச்சொல்லை உள்ளிடவும்' });
        }

        const { usersCollection } = await connectToDb();
        const user = await usersCollection.findOne({ _id: new ObjectId(req.user._id) });

        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            res.json({ success: true });
        } else {
            res.status(401).json({ message: 'தற்போதைய கடவுச்சொல் தவறானது (Incorrect password)' });
        }
    } catch (error) {
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};

export const getSecurityQuestion = async (req, res) => {
    try {
        const { identifier } = req.params;
        const { usersCollection } = await connectToDb();

        const searchIdentifier = identifier.toLowerCase().trim();
        const user = await usersCollection.findOne({
            $or: [{ email: searchIdentifier }, { mobile: searchIdentifier }]
        });

        if (!user) {
            return res.status(404).json({ message: 'இந்த மின்னஞ்சல் அல்லது கைபேசி எண் இல்லை' });
        }
        if (!user.securityQuestion) {
            return res.status(400).json({ message: 'இந்த கணக்கில் பாதுகாப்பு கேள்வி அமைக்கப்படவில்லை' });
        }

        res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        res.status(500).json({ message: 'சேவையக பிழை' });
    }
};

export const verifySecurityAnswer = async (req, res) => {
    try {
        const { identifier, securityAnswer } = req.body;
        if (!identifier || !securityAnswer) {
            return res.status(400).json({ message: 'மின்னஞ்சல்/கைபேசி மற்றும் பதிலை அளிக்கவும்' });
        }

        const { usersCollection } = await connectToDb();

        const searchIdentifier = identifier.toLowerCase().trim();
        const user = await usersCollection.findOne({
            $or: [{ email: searchIdentifier }, { mobile: searchIdentifier }]
        });

        if (!user) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை' });
        }

        if (!user.securityAnswer || user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
            return res.status(400).json({ message: 'பதில் தவறானது' });
        }

        // Generate a temporary reset token (valid for 15 mins)
        const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026', { expiresIn: '15m' });

        res.json({ resetToken });
    } catch (error) {
        console.error('Verify Security Answer Error:', error);
        res.status(500).json({ message: 'சேவையக பிழை' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'விவரங்கள் கிடைக்கவில்லை' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' });
        }

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026');

        if (decoded.type !== 'reset') {
            return res.status(400).json({ message: 'தவறான டோக்கன்' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { usersCollection } = await connectToDb();
        await usersCollection.updateOne(
            { _id: new ObjectId(decoded.id) },
            { $set: { password: hashedPassword } }
        );

        res.json({ message: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'காலாவதியான கோரிக்கை. மீண்டும் முயற்சிக்கவும்.' });
        }
        res.status(500).json({ message: 'சேவையக பிழை' });
    }
};

export const updateSecurityDetails = async (req, res) => {
    try {
        const { securityQuestion, securityAnswer, mobile } = req.body;

        if (!securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: 'கேள்வி மற்றும் பதிலை அளிக்கவும்' });
        }

        const { usersCollection } = await connectToDb();

        const updateData = {
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim()
        };

        if (mobile) {
            updateData.mobile = mobile.trim();
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(req.user._id) },
            { $set: updateData }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            res.json({ message: 'பாதுகாப்பு விவரங்கள் வெற்றிகரமாக மாற்றப்பட்டன' });
        } else {
            res.status(400).json({ message: 'விவரங்களை மாற்றுவதில் பிழை' });
        }
    } catch (error) {
        console.error('Update Security Details Error:', error);
        res.status(500).json({ message: 'சேவையக பிழை (Server Error)' });
    }
};
