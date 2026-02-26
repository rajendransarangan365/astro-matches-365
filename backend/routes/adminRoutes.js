import express from 'express';
import { connectToDb } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// GET all users (Admin only)
router.get('/users', protectAdmin, async (req, res) => {
    try {
        const { usersCollection } = await connectToDb();
        const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users for admin:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PATCH toggle voice assistant access (Admin only)
router.patch('/users/:id/voice-access', protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { canUseVoiceAssistant } = req.body;

        const { usersCollection } = await connectToDb();
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { canUseVoiceAssistant } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை (User not found)' });
        }

        res.json({ message: 'பயனர் அனுமதி புதுப்பிக்கப்பட்டது (Access updated)' });
    } catch (error) {
        console.error('Error toggling voice access:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET search user for security question recovery (Admin only)
router.get('/users/search', protectAdmin, async (req, res) => {
    try {
        const { q } = req.query; // Search by email or mobile
        if (!q) {
            return res.status(400).json({ message: 'தேடல் விவரங்களை உள்ளிடவும் (Provide search query)' });
        }

        const searchQuery = q.toLowerCase().trim();
        const { usersCollection } = await connectToDb();

        const user = await usersCollection.findOne({
            $or: [{ email: searchQuery }, { mobile: searchQuery }]
        }, { projection: { password: 0 } }); // Don't return password

        if (!user) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை (User not found)' });
        }

        res.json({
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            securityQuestion: user.securityQuestion || 'Setup not complete',
            securityAnswer: user.securityAnswer || 'Setup not complete'
        });
    } catch (error) {
        console.error('Error searching user for admin:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
