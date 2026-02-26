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

        // If an old image public_id was provided, delete the old image to save space
        const { oldPublicId } = req.body;
        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
            } catch (destroyError) {
                console.error("Failed to destroy old image in Cloudinary:", destroyError);
                // We proceed even if destroy fails so the new upload isn't blocked
            }
        }

        res.json({
            url: req.file.path,
            public_id: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.params;
        if (!public_id) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result !== 'ok' && result.result !== 'not found') {
            return res.status(400).json({ message: 'Failed to delete image from Cloudinary', result });
        }

        res.json({ message: 'Image deleted successfully', result });
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getCloudinaryUsage = async (req, res) => {
    try {
        // Cloudinary SDK admin API for usage statistics
        const result = await cloudinary.api.usage();

        // In free tier, storage limit is typically 25 credits (1 credit = 1GB or 1000 transformations)
        // Here we focus on storage specifically if possible, or just send the whole result
        // In free tier, storage limit is typically 25 credits (1 credit = 1GB)
        res.json({
            plan: result.plan || 'Free',
            usage: (result.storage && result.storage.usage) || 0, // total storage used in bytes
            limit: ((result.credits && result.credits.limit) || 25) * 1024 * 1024 * 1024, // approx 1GB per credit
            usedCredits: (result.credits && result.credits.usage) || 0,
            totalCredits: (result.credits && result.credits.limit) || 25,
        });
    } catch (error) {
        console.error('Cloudinary usage error:', error);
        res.status(500).json({ message: 'Failed to fetch usage stats' });
    }
};
