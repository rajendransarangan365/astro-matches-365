import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("astro365");
        const usersCollection = db.collection("users");
        const matchesCollection = db.collection("matches");
        const profilesCollection = db.collection("profiles");

        // Signup
        app.post('/api/auth/signup', async (req, res) => {
            try {
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
                const matches = await matchesCollection.find({ userId: new ObjectId(req.user.id) }).sort({ createdAt: -1 }).toArray();
                res.json(matches);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Save Profile
        app.post('/api/profiles', authenticate, async (req, res) => {
            try {
                const { type, profileData } = req.body;

                if (!type || !profileData) {
                    return res.status(400).json({ message: "Type and profileData are required" });
                }

                const dataToInsert = {
                    userId: new ObjectId(req.user.id),
                    type,
                    profileData,
                    createdAt: new Date()
                };

                const result = await profilesCollection.insertOne(dataToInsert);
                res.status(201).json(result);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Get Profiles
        app.get('/api/profiles', authenticate, async (req, res) => {
            try {
                const { type } = req.query;
                const query = { userId: new ObjectId(req.user.id) };
                if (type) {
                    query.type = type;
                }

                const profiles = await profilesCollection.find(query).sort({ createdAt: -1 }).toArray();
                res.json(profiles);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (err) {
        console.error(err);
    }
}

run().catch(console.dir);
