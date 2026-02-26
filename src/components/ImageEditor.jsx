import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { Check, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ImageEditor = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => setCrop(crop);
    const onZoomChange = (zoom) => setZoom(zoom);

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(8px)'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    background: 'var(--bg-card, #1a1b1e)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>Edit Photo</h3>
                    <button
                        onClick={onCancel}
                        style={{ padding: '0.5rem', background: 'transparent', color: 'rgba(255,255,255,0.5)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Editor Area */}
                <div style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: '300px',
                    maxHeight: '400px',
                    background: '#000'
                }}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                {/* Controls Area */}
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    {/* Zoom Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <ZoomOut size={16} color="rgba(255,255,255,0.4)" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary, #3b82f6)' }}
                        />
                        <ZoomIn size={16} color="rgba(255,255,255,0.4)" />
                    </div>

                    {/* Rotation Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <RotateCcw size={16} color="rgba(255,255,255,0.4)" />
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary, #3b82f6)' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onCancel}
                            className="btn-sm btn-outline"
                            style={{ flex: 1, height: '44px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="btn-sm"
                            style={{ flex: 1, height: '44px', background: 'var(--primary, #3b82f6)', color: 'white' }}
                        >
                            <Check size={18} style={{ marginRight: '0.5rem' }} /> Apply
                        </button>
                    </div>

                    <p style={{
                        margin: '1rem 0 0',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                    }}>
                        Drag to reposition • Pinch to zoom
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Helper function to create the cropped image
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
}

function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

export default ImageEditor;
