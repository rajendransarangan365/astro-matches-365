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

// PATCH toggle image upload access (Admin only)
router.patch('/users/:id/image-access', protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { canUploadImages } = req.body;

        const { usersCollection } = await connectToDb();
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { canUploadImages } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை (User not found)' });
        }

        res.json({ message: 'புகைப்பட அனுமதி புதுப்பிக்கப்பட்டது (Image access updated)' });
    } catch (error) {
        console.error('Error toggling image access:', error);
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

// PATCH toggle admin status (Admin only)
router.patch('/users/:id/admin-access', protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;

        const { usersCollection } = await connectToDb();

        // Prevent removing admin from owner
        if (!isAdmin) {
            const user = await usersCollection.findOne({ _id: new ObjectId(id) });
            if (user && user.email === 'sarangan365@gmail.com') {
                return res.status(403).json({ message: 'உரிமையாளரின் நிர்வாகி அனுமதியை நீக்க முடியாது (Cannot remove owner admin access)' });
            }
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isAdmin } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை (User not found)' });
        }

        res.json({ message: 'நிர்வாகி அனுமதி புதுப்பிக்கப்பட்டது (Admin access updated)' });
    } catch (error) {
        console.error('Error toggling admin access:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE remove a user (Admin only)
router.delete('/users/:id', protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const { usersCollection } = await connectToDb();

        // Prevent deleting the owner account
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (user && user.email === 'sarangan365@gmail.com') {
            return res.status(403).json({ message: 'உரிமையாளர் கணக்கை நீக்க முடியாது (Cannot delete owner account)' });
        }

        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'பயனர் கிடைக்கவில்லை (User not found)' });
        }

        res.json({ message: 'பயனர் நீக்கப்பட்டார் (User deleted)' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
