import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDb } from '../config/db.js';

export const signup = async (req, res) => {
    try {
        const { usersCollection } = await connectToDb();
        const { name, email, password } = req.body;
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.insertedId, name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { usersCollection } = await connectToDb();
        const { email, password } = req.body;
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
