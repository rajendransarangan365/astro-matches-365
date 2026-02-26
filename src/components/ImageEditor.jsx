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
                background: 'rgba(0,0,0,0.9)',
                zIndex: 999999, // Super high z-index to stay above bottom nav
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0, // No padding so it can fill the screen
                backdropFilter: 'blur(10px)'
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '100%',
                    maxHeight: '100dvh', // Use dvh for better mobile browser support
                    background: '#1a1b1e',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>Edit Photo</h3>
                    <button
                        onClick={onCancel}
                        style={{ padding: '0.4rem', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Editor Area */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    flex: 1, // Take up all remaining space
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column'
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
                        style={{
                            containerStyle: {
                                height: '100%',
                                width: '100%'
                            }
                        }}
                    />
                </div>

                {/* Controls Area */}
                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(26, 27, 30, 0.95)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    flexShrink: 0,
                    zIndex: 2 // Ensure controls stay above cropper
                }}>
                    {/* Zoom Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <ZoomOut size={16} color="rgba(255,255,255,0.4)" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#3b82f6', height: '4px' }}
                        />
                        <ZoomIn size={16} color="rgba(255,255,255,0.4)" />
                    </div>

                    {/* Rotation Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <RotateCcw size={16} color="rgba(255,255,255,0.4)" />
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#3b82f6', height: '4px' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: 'white',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: '#3b82f6',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            <Check size={18} /> Apply
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
