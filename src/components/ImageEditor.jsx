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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                height: '400px',
                background: '#111',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
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
                            borderRadius: '1.5rem'
                        }
                    }}
                />
            </div>

            <div style={{
                marginTop: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Zoom Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <ZoomOut size={18} color="rgba(255,255,255,0.5)" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <ZoomIn size={18} color="rgba(255,255,255,0.5)" />
                </div>

                {/* Rotation Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <RotateCcw size={18} color="rgba(255,255,255,0.5)" />
                    <input
                        type="range"
                        value={rotation}
                        min={0}
                        max={360}
                        step={1}
                        aria-labelledby="Rotation"
                        onChange={(e) => setRotation(e.target.value)}
                        style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-sm btn-outline"
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={{ flex: 1, background: 'var(--primary)', color: 'white' }}
                    >
                        <Check size={18} /> Apply Crop
                    </button>
                </div>
            </div>

            <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                Drag to position • Pinch/Scroll to zoom
            </p>
        </div>
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
