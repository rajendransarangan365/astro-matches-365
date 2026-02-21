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
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'அனைத்து விவரங்களையும் நிரப்பவும்' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' });
        }

        const { usersCollection } = await connectToDb();

        const userExists = await usersCollection.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await usersCollection.insertOne({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date()
        });

        if (result.insertedId) {
            res.status(201).json({
                _id: result.insertedId,
                name,
                email: email.toLowerCase().trim(),
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
