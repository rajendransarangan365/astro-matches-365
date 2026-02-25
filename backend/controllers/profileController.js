import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';

export const saveProfile = async (req, res) => {
    try {
        const { profilesCollection } = await connectToDb();
        const { type, profileData } = req.body;

        if (!type || !profileData) {
            return res.status(400).json({ message: "Type and profileData are required" });
        }

        const dataToInsert = {
            userId: new ObjectId(req.user.id),
            type, // 'bride' or 'groom'
            profileData,
            createdAt: new Date()
        };

        const result = await profilesCollection.insertOne(dataToInsert);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getProfiles = async (req, res) => {
    try {
        const { profilesCollection } = await connectToDb();
        const { type } = req.query; // Optional filter by type

        const query = { userId: new ObjectId(req.user.id) };
        if (type) {
            query.type = type;
        }

        const profiles = await profilesCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const { profilesCollection } = await connectToDb();
        const { id } = req.params;

        const result = await profilesCollection.deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(req.user.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Profile not found or not authorized" });
        }

        res.json({ message: "Profile deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
