import React from 'react';
import { motion } from 'framer-motion';
import { PLANETS } from '../data/poruthamData';

const RASI_ORDER = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];

const RASI_NAMES = {
    1: "மேஷ", 2: "ரிஷ", 3: "மிது", 4: "கட",
    5: "சிம்", 6: "கன்", 7: "துலா", 8: "விரு",
    9: "தனு", 10: "மக", 11: "கும்", 12: "மீன"
};

const RasiKattam = ({ title, chartData, color, highlightRasiId }) => {
    return (
        <div style={{ marginBottom: '1.5rem', flex: 1 }}>
            <h4 style={{ fontSize: '0.85rem', color: color, marginBottom: '0.5rem', textAlign: 'center' }}>
                {title}
            </h4>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2px',
                maxWidth: '280px',
                margin: '0 auto',
                background: 'rgba(251, 191, 36, 0.2)',
                padding: '2px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
                {RASI_ORDER.map((id, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: id === null ? 'transparent' : 'rgba(15, 23, 42, 0.8)',
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem',
                            color: '#94a3b8',
                            border: id === null ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {id && (
                            <>
                                <span style={{ opacity: 0.3, position: 'absolute', top: 2, right: 2, fontSize: '0.5rem' }}>{RASI_NAMES[id]}</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center' }}>
                                    {chartData[id]?.map(pId => {
                                        const planet = PLANETS.find(p => p.id === pId);
                                        const displayName = planet ? planet.nameTamilShort : pId;
                                        return (
                                            <span key={pId} style={{
                                                fontSize: '0.65rem',
                                                background: pId === 'La' || pId === 'லக்' ? color : 'rgba(255,255,255,0.1)',
                                                color: pId === 'La' || pId === 'லக்' ? 'black' : 'white',
                                                padding: '0 2px',
                                                borderRadius: '2px',
                                                fontWeight: 'bold'
                                            }}>
                                                {displayName}
                                            </span>
                                        );
                                    })}
                                    {id === parseInt(highlightRasiId) && !chartData[id]?.includes('Mo') && (
                                        <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>🌑</span>
                                    )}
                                </div>
                            </>
                        )}
                        {index === 5 && (
                            <div style={{
                                gridColumn: 'span 2',
                                gridRow: 'span 2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                opacity: 0.1
                            }}>
                                ॐ
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RasiKattam;
