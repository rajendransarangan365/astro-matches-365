import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import RasiKattam from './RasiKattam';

const PoruthamResult = ({ data }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!data) return null;

    const { results, recommendation, canMarry, score, bride, groom, doshamResult, summaryReport } = data;

    return (
        <div className="results-section">
            <motion.div
                layout
                className={`match-status ${canMarry ? 'success' : 'fail'}`}
                onClick={() => setShowDetails(!showDetails)}
                style={{ cursor: 'pointer', position: 'relative' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {canMarry ? (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Heart size={48} fill="#ef4444" color="#ef4444" />
                        </motion.div>
                    ) : (
                        <AlertCircle size={48} />
                    )}
                </div>
                <h2 style={{ color: canMarry ? '#4ade80' : '#f87171' }}>
                    {canMarry ? 'பொருத்தம் உண்டு' : 'பொருத்தம் இல்லை'}
                </h2>
                <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>{recommendation}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{summaryReport?.percentage}%</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{summaryReport?.verdict}</div>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: 0.7 }}>
                    {showDetails ? (
                        <><ChevronUp size={14} /> விவரங்களை மறை (Hide Details)</>
                    ) : (
                        <><ChevronDown size={14} /> விவரங்களைக் காண சொடுக்கவும் (Click for details)</>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {summaryReport && (
                            <div className="glass-card" style={{ border: '1px solid var(--primary)', background: 'rgba(251, 191, 36, 0.05)' }}>
                                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>சுருக்கமான அறிக்கை (Summary Report)</h3>

                                <div style={{ marginBottom: '1rem' }}>
                                    <h5 style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '0.5rem' }}>நிறைகள் (Pros):</h5>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                        {summaryReport.pros.map((p, i) => (
                                            <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{p}</li>
                                        ))}
                                    </ul>
                                </div>

                                {summaryReport.cons.length > 0 && (
                                    <div>
                                        <h5 style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.5rem' }}>குறைகள் (Cons):</h5>
                                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                            {summaryReport.cons.map((c, i) => (
                                                <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="glass-card">
                            <h3>பொருத்தம் விவரங்கள் (Details)</h3>
                            <div className="porutham-list" style={{ marginTop: '1rem' }}>
                                {Object.entries(results).map(([key, value]) => (
                                    <div key={key} className="porutham-item">
                                        <div className="porutham-info">
                                            <span className="porutham-name">{value.name}</span>
                                            <span className={`porutham-status`} style={{ color: value.status === 'No Match' ? '#f87171' : '#4ade80', fontSize: '0.8rem' }}>
                                                {value.status === 'Match' ? 'பொருத்தம்' : value.status === 'No Match' ? 'பொருத்தம் இல்லை' : 'சமம்'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {value.status === 'Match' ? (
                                                <CheckCircle2 color="#4ade80" size={20} />
                                            ) : value.status === 'No Match' ? (
                                                <XCircle color="#f87171" size={20} />
                                            ) : (
                                                <AlertCircle color="#94a3b8" size={20} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {doshamResult && (
                            <div className="glass-card" style={{ marginTop: '1rem' }}>
                                <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>செவ்வாய் தோஷம் (Chevvai Dosham)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ color: '#f472b6', fontWeight: 'bold' }}>பெண்:</div>
                                        {doshamResult.bride.hasDosham ? (
                                            <div style={{ color: '#f87171' }}>தோஷம் உண்டு: {doshamResult.bride.details}</div>
                                        ) : (
                                            <div style={{ color: '#4ade80' }}>தோஷம் இல்லை</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>ஆண்:</div>
                                        {doshamResult.groom.hasDosham ? (
                                            <div style={{ color: '#f87171' }}>தோஷம் உண்டு: {doshamResult.groom.details}</div>
                                        ) : (
                                            <div style={{ color: '#4ade80' }}>தோஷம் இல்லை</div>
                                        )}
                                    </div>
                                </div>
                                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: doshamResult.match === 'Match' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                    முடிவு: {doshamResult.recommendation}
                                </p>
                            </div>
                        )}

                        <div className="glass-card" style={{ marginTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>ஜாதகக் கட்டங்கள் (Charts)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <div style={{ color: '#f472b6', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>பெண் ஜாதகம்</div>
                                    <RasiKattam title="பெண் இராசி" chartData={bride.rasiChart} color="#f472b6" highlightRasiId={bride.rasiId} />
                                    <RasiKattam title="பெண் நவாம்சம்" chartData={bride.navamsamChart} color="#f472b6" />
                                </div>
                                <div>
                                    <div style={{ color: '#60a5fa', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>ஆண் ஜாதகம்</div>
                                    <RasiKattam title="ஆண் இராசி" chartData={groom.rasiChart} color="#60a5fa" highlightRasiId={groom.rasiId} />
                                    <RasiKattam title="ஆண் நவாம்சம்" chartData={groom.navamsamChart} color="#60a5fa" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PoruthamResult;
