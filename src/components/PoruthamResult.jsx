import React, { useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Heart, ChevronDown, ChevronUp, Sparkles, Download, Share2, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import RasiKattam from './RasiKattam';

const PoruthamResult = ({ data }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef(null);

    if (!data) return null;

    const { results, recommendation, canMarry, score, bride, groom, doshamResult, summaryReport } = data;

    const handleDownloadPDF = async (e) => {
        e.stopPropagation();
        if (!reportRef.current) return;

        // Ensure details are visible for capturing
        const wasHidden = !showDetails;
        if (wasHidden) setShowDetails(true);

        setIsDownloading(true);

        try {
            // Small delay to allow charts/details to render if they were hidden
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#020617' // Match root bg-darker
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Thirumana_Porutham_${bride.name}_${groom.name}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('PDF டவுன்லோட் செய்வதில் பிழை ஏற்பட்டது (Failed to download PDF)');
        } finally {
            setIsDownloading(false);
            if (wasHidden) setShowDetails(false);
        }
    };

    const handleWhatsAppShare = (e) => {
        e.stopPropagation();
        let message = `*திருமணப் பொருத்த அறிக்கை*\n`;
        message += `பெண்: ${bride.name} | ஆண்: ${groom.name}\n\n`;
        message += `*முடிவு*: ${canMarry ? 'பொருத்தம் உண்டு ✅' : 'பொருத்தம் இல்லை ❌'}\n`;
        message += `*பொருத்தம்*: ${summaryReport?.percentage}%\n`;
        message += `${recommendation}\n\n`;

        if (summaryReport.pros.length > 0) {
            message += `*நிறைகள்*:\n`;
            summaryReport.pros.forEach(p => { message += `- ${p}\n`; });
            message += `\n`;
        }

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

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

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        style={{
                            background: 'rgba(251, 191, 36, 0.15)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            width: 'auto',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            marginTop: 0,
                            opacity: isDownloading ? 0.5 : 1
                        }}
                    >
                        {isDownloading ? 'தயாராகிறது...' : <><Download size={16} /> PDF டவுன்லோட்</>}
                    </button>
                    <button
                        onClick={handleWhatsAppShare}
                        style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            border: '1px solid #4ade80',
                            width: 'auto',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            marginTop: 0
                        }}
                    >
                        <Share2 size={16} /> WhatsApp-ல் பகிர்க
                    </button>
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
                        ref={reportRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden', paddingBottom: '1rem' }}
                    >
                        <div style={{ background: 'var(--bg-darker)', padding: isDownloading ? '1rem' : 0 }}>
                            {summaryReport && (
                                <div className="glass-card" style={{ border: '1px solid var(--primary)', background: 'rgba(168, 85, 247, 0.05)' }}>
                                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Sparkles size={20} color="#c084fc" /> ஜாதகப் பலன் & அறிக்கை
                                    </h3>

                                    {summaryReport.lifeSummary && (
                                        <div style={{
                                            lineHeight: '1.8',
                                            fontSize: '0.95rem',
                                            color: '#e2e8f0',
                                            whiteSpace: 'pre-wrap',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            marginBottom: '1.5rem',
                                            borderLeft: '4px solid #c084fc'
                                        }}>
                                            {summaryReport.lifeSummary}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <h5 style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '0.5rem' }}>நிறைகள் (Pros):</h5>
                                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                {summaryReport.pros.map((p, i) => (
                                                    <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{p}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h5 style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.5rem' }}>குறைகள் (Cons):</h5>
                                            {summaryReport.cons.length > 0 ? (
                                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                    {summaryReport.cons.map((c, i) => (
                                                        <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{c}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>குறிப்பிடத்தக்க குறைகள் ஏதுமில்லை (None).</p>
                                            )}
                                        </div>
                                    </div>
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
                                    <h3 style={{ color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Scale size={20} /> பாபசாம்யம் (Dosha Samyam - Planetary Match)
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #f472b6' }}>
                                            <div style={{ color: '#f472b6', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>பெண் (Bride)</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                                                {doshamResult.bride.points} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.7 }}>புள்ளிகள் (Points)</span>
                                            </div>
                                            {doshamResult.bride.details.length > 0 ? (
                                                <ul style={{ paddingLeft: '1rem', margin: 0, color: '#f87171', opacity: 0.9 }}>
                                                    {doshamResult.bride.details.map((d, i) => <li key={i}>{d}</li>)}
                                                </ul>
                                            ) : (
                                                <div style={{ color: '#4ade80' }}>குறிப்பிடத்தக்க தோஷம் இல்லை</div>
                                            )}
                                        </div>
                                        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #60a5fa' }}>
                                            <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>ஆண் (Groom)</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                                                {doshamResult.groom.points} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.7 }}>புள்ளிகள் (Points)</span>
                                            </div>
                                            {doshamResult.groom.details.length > 0 ? (
                                                <ul style={{ paddingLeft: '1rem', margin: 0, color: '#f87171', opacity: 0.9 }}>
                                                    {doshamResult.groom.details.map((d, i) => <li key={i}>{d}</li>)}
                                                </ul>
                                            ) : (
                                                <div style={{ color: '#4ade80' }}>குறிப்பிடத்தக்க தோஷம் இல்லை</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: doshamResult.match === 'Match' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: doshamResult.match === 'Match' ? '#4ade80' : '#f87171', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {doshamResult.match === 'Match' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            முடிவு: {doshamResult.recommendation}
                                        </p>
                                    </div>
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PoruthamResult;
