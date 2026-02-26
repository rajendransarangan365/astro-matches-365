import jwt from 'jsonwebtoken';
import { connectToDb } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tamil_marriage_matching_secret_key_pro_2026');

            const { usersCollection } = await connectToDb();
            const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } });

            if (!user) {
                return res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, பயனர் இல்லை (Not authorized, no user)' });
            }

            if (!user.isAdmin) {
                return res.status(403).json({ message: 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி (Admin only)' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Admin Auth Error:', error);
            res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் தவறானது (Not authorized)' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'அங்கீகரிக்கப்படவில்லை, டோக்கன் இல்லை (Not authorized, no token)' });
    }
};
