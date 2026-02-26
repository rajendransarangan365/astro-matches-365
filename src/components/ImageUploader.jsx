import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageEditor from './ImageEditor';

const ImageUploader = ({ onUploadSuccess, currentImageUrl, currentImagePublicId, onDeleteSuccess, token }) => {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [editorOpen, setEditorOpen] = useState(false);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await fetch('/api/upload/usage', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch usage stats', err);
            }
        };
        fetchUsage();
    }, [token]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setOriginalImage(reader.result);
            setEditorOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob) => {
        setEditorOpen(false);
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', croppedBlob, 'profile.jpg');

        // Pass old public ID if we are replacing an existing image
        if (currentImagePublicId) {
            formData.append('oldPublicId', currentImagePublicId);
        }

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onUploadSuccess(data.url, data.public_id);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!currentImagePublicId) {
            // Just local clear if no public ID
            if (onDeleteSuccess) onDeleteSuccess();
            return;
        }

        if (!window.confirm("Are you sure you want to delete this profile photo?")) {
            return;
        }

        setDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/upload/${currentImagePublicId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete image');

            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                // Fallback if onDeleteSuccess is not provided
                onUploadSuccess('', '');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getSpaceInfo = () => {
        if (!stats) return null;
        // resources usage in bytes or total units
        // Cloudinary free tier typically gives 25 credits. 1 credit = 1GB or 1000 transformations.
        // The API returns 'resources' in terms of percentage or absolute usage.
        const usage = stats.usage || 0;
        const limit = stats.limit || 0;
        const percent = limit > 0 ? (usage / limit) * 100 : 0;
        const free = limit - usage;

        // Convert to human readable format
        const formatSize = (bytes) => {
            if (isNaN(bytes) || bytes < 0) return 'Unknown';
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        return {
            percent: percent.toFixed(1),
            free: formatSize(free)
        };
    };

    const spaceInfo = getSpaceInfo();

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Profile Photo (1:1)</label>
                {spaceInfo && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <HardDrive size={10} />
                        Free Space: <span style={{ color: spaceInfo.percent > 90 ? 'var(--danger)' : 'var(--success)' }}>{spaceInfo.free}</span>
                    </div>
                )}
            </div>

            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '2px dashed var(--glass-border)',
                background: 'var(--bg-input)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
            }}>
                {deleting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 className="animate-spin" size={24} color="var(--danger)" />
                        <span style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>DELETING</span>
                    </div>
                ) : currentImageUrl ? (
                    <>
                        <img
                            src={currentImageUrl}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={handleDeleteImage}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.8)',
                                color: 'white',
                                opacity: 0.8
                            }}
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <label style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        margin: 0
                    }}>
                        {uploading ? (
                            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
                        ) : (
                            <>
                                <Upload size={24} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.6rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>UPLOAD</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            {editorOpen && (
                <ImageEditor
                    image={originalImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setEditorOpen(false)}
                />
            )}

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ color: 'var(--danger)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.5rem' }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUploader;
