import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';

export const saveMatch = async (req, res) => {
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
};

export const getMatches = async (req, res) => {
    try {
        const { matchesCollection } = await connectToDb();
        const matches = await matchesCollection.find({ userId: new ObjectId(req.user.id) }).sort({ createdAt: -1 }).toArray();
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
