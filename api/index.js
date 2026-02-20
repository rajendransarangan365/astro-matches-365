import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = (process.env.MONGODB_URI || "").trim();
const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
});

let db, usersCollection, matchesCollection;

async function connectToDb() {
    if (db) return { usersCollection, matchesCollection };
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db("astro365");
        usersCollection = db.collection("users");
        matchesCollection = db.collection("matches");
        return { usersCollection, matchesCollection };
    } catch (error) {
        console.error("MongoDB Connection Error Details:", {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
}

// Signup
app.post('/api/auth/signup', async (req, res) => {
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
});

// Login
app.post('/api/auth/login', async (req, res) => {
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
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Save Match
app.post('/api/matches', authenticate, async (req, res) => {
    try {
        const { matchesCollection } = await connectToDb();
        const matchData = {
            userId: new ObjectId(req.user.id),
            ...req.body,
            createdAt: new Date()
        };
        const result = await matchesCollection.insertOne(matchData);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Matches
app.get('/api/matches', authenticate, async (req, res) => {
    try {
        const { matchesCollection } = await connectToDb();
        const matches = await matchesCollection.find({ userId: new ObjectId(req.user.id) }).sort({ createdAt: -1 }).toArray();
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export for Vercel
export default app;
