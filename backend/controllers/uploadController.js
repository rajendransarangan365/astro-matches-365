import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'astro_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
    },
});

export const upload = multer({ storage: storage });

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: req.file.path,
            public_id: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCloudinaryUsage = async (req, res) => {
    try {
        // Cloudinary SDK admin API for usage statistics
        const result = await cloudinary.api.usage();

        // In free tier, storage limit is typically 25 credits (1 credit = 1GB or 1000 transformations)
        // Here we focus on storage specifically if possible, or just send the whole result
        res.json({
            plan: result.plan,
            usage: result.resources, // total storage used
            limit: result.resources_limit, // total storage limit
            credits: result.credits, // general credit usage for free tier
        });
    } catch (error) {
        console.error('Cloudinary usage error:', error);
        res.status(500).json({ message: 'Failed to fetch usage stats' });
    }
};
