import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

export const saveProfile = async (req, res) => {
    try {
        const { profilesCollection } = await connectToDb();
        const { type, profileData, id } = req.body;

        if (!type || !profileData) {
            return res.status(400).json({ message: "Type and profileData are required" });
        }

        const dataToSave = {
            userId: new ObjectId(req.user.id),
            type, // 'bride' or 'groom'
            profileData,
            updatedAt: new Date()
        };

        let result;
        if (id) {
            // Update existing
            result = await profilesCollection.updateOne(
                { _id: new ObjectId(id), userId: new ObjectId(req.user.id) },
                { $set: { ...dataToSave } }
            );
            res.json({ message: "Profile updated successfully", result });
        } else {
            // Insert new
            dataToSave.createdAt = new Date();
            result = await profilesCollection.insertOne(dataToSave);
            res.status(201).json(result);
        }
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

        // Find the profile first to see if it has an imagePublicId
        const profile = await profilesCollection.findOne({
            _id: new ObjectId(id),
            userId: new ObjectId(req.user.id)
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found or not authorized" });
        }

        // Delete from Cloudinary if there is an image
        if (profile.profileData && profile.profileData.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(profile.profileData.imagePublicId);
            } catch (cloudErr) {
                console.error("Failed to delete image from Cloudinary:", cloudErr);
            }
        }

        const result = await profilesCollection.deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(req.user.id)
        });

        res.json({ message: "Profile deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
