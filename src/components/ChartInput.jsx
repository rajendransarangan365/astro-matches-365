import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PLANETS } from '../data/poruthamData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const RASI_ORDER = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];

const RasiHouseInput = ({ houseId, planets, onTogglePlanet }) => {
    const [showPicker, setShowPicker] = useState(false);

    if (houseId === null) return <div style={{ aspectRatio: '1' }}></div>;

    return (
        <div
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                aspectRatio: '1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2px',
                position: 'relative',
                cursor: 'pointer'
            }}
            onClick={() => setShowPicker(true)}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', fontSize: '0.6rem' }}>
                {planets.map(pId => {
                    const planet = PLANETS.find(p => p.id === pId);
                    return (
                        <span key={pId} style={{ background: 'var(--primary)', color: 'black', padding: '0 2px', borderRadius: '2px' }}>
                            {planet?.nameTamilShort || pId}
                        </span>
                    );
                })}
            </div>

            {!planets.length && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}>
                    <Plus size={16} />
                </div>
            )}

            {createPortal(
                <AnimatePresence>
                    {showPicker && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '1rem'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPicker(false);
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    width: '100%',
                                    maxWidth: '300px',
                                    maxHeight: '85vh',
                                    overflowY: 'auto'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h5 style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', margin: 0 }}>கிரகங்களைத் தேர்வு செய்க</h5>
                                    <X size={18} cursor="pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPicker(false);
                                    }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {PLANETS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTogglePlanet(houseId, p.id);
                                            }}
                                            style={{
                                                padding: '0.6rem 0.4rem',
                                                fontSize: '0.75rem',
                                                background: planets.includes(p.id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                color: planets.includes(p.id) ? 'black' : 'white',
                                                border: '1px solid ' + (planets.includes(p.id) ? 'var(--primary)' : 'rgba(255,255,255,0.1)'),
                                                borderRadius: '0.5rem',
                                                fontWeight: '500',
                                                margin: 0
                                            }}
                                        >
                                            {p.nameTamil}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPicker(false);
                                    }}
                                    style={{
                                        marginTop: '1rem',
                                        background: '#334155',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        padding: '0.6rem'
                                    }}
                                >
                                    சரி (Done)
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

const ChartInput = ({ title, chartData, onChange }) => {
    const handleTogglePlanet = (houseId, planetId) => {
        const newData = { ...chartData };
        if (!newData[houseId]) newData[houseId] = [];

        if (newData[houseId].includes(planetId)) {
            newData[houseId] = newData[houseId].filter(id => id !== planetId);
        } else {
            // Remove planet from anywhere else it might be
            Object.keys(newData).forEach(hId => {
                newData[hId] = newData[hId].filter(id => id !== planetId);
            });
            newData[houseId].push(planetId);
        }
        onChange(newData);
    };

    return (
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label style={{
                justifyContent: 'center',
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--primary-light)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                width: '100%',
                display: 'flex'
            }}>
                {title}
            </label>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1px',
                width: '100%',
                aspectRatio: '1/1',
                margin: '0 auto',
                background: 'rgba(251, 191, 36, 0.3)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
                padding: '1px',
                boxSizing: 'border-box'
            }}>
                {RASI_ORDER.map((id, index) => (
                    <RasiHouseInput
                        key={index}
                        houseId={id}
                        planets={chartData[id] || []}
                        onTogglePlanet={handleTogglePlanet}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChartInput;
