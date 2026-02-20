import React, { useState, useRef } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { calculatePorutham } from '../utils/poruthamLogic';
import { Search, Star, User, Moon, CheckCircle2, XCircle, TrendingUp, Filter, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MatchFinder = () => {
    const [searchType, setSearchType] = useState('bride'); // 'bride' looking for groom, or 'groom' looking for bride
    const [myStar, setMyStar] = useState('');
    const [myRasi, setMyRasi] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null); // Tracks which result card is opened
    const tableRef = useRef(null);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const pdf = new jsPDF('p', 'pt', 'a4');
            const selectedStar = STARS.find(s => s.id === parseInt(myStar))?.nameEnglish || 'Star';
            const selectedRasi = RASIS.find(r => r.id === parseInt(myRasi))?.nameEnglish || 'Rasi';
            const selectedStarTamil = STARS.find(s => s.id === parseInt(myStar))?.nameTamil || '';
            const selectedRasiTamil = RASIS.find(r => r.id === parseInt(myRasi))?.nameTamil || '';

            // Add title
            pdf.setFontSize(16);
            pdf.text(`${searchType === 'bride' ? 'Bride' : 'Groom'} Match Results (${selectedStar} - ${selectedRasi})`, 40, 40);

            // Prepare table data
            const tableColumn = ["Rank", "Star & Rasi", "Score", "Match Quality", "Critical Notes"];
            const tableRows = [];

            results.forEach((res, index) => {
                const isExcellent = res.totalScore >= 9;
                const isGood = res.totalScore >= 7;
                const qualityStr = isExcellent ? "Excellent" : isGood ? "Good" : "Average";

                // Look for missing critical poruthams to highlight in notes
                const missingCriticals = [];
                if (res.details.rasi.status !== 'Match') missingCriticals.push('Rasi');
                if (res.details.rasiAthipathi.status !== 'Match') missingCriticals.push('Athi');
                if (res.details.rajju.status !== 'Match') missingCriticals.push('Rajju');
                if (res.details.mahendra.status !== 'Match') missingCriticals.push('Mahen');
                if (res.details.yoni.status !== 'Match') missingCriticals.push('Yoni');

                const notes = missingCriticals.length > 0 ? `Missing: ${missingCriticals.join(', ')}` : 'All Core Matches Present!';

                const rowData = [
                    `#${index + 1}`,
                    `${res.star.nameEnglish} (${res.rasi.nameEnglish})`,
                    `${res.totalScore} / 12`,
                    qualityStr,
                    notes
                ];
                tableRows.push(rowData);
            });

            autoTable(pdf, {
                head: [tableColumn],
                body: tableRows,
                startY: 50,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
            });

            const fileName = searchType === 'bride'
                ? `Matches_for_Bride_${selectedStar}_${selectedRasi}.pdf`
                : `Matches_for_Groom_${selectedStar}_${selectedRasi}.pdf`;

            pdf.save(fileName);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("PDF பதிவிறக்குவதில் பிழை ஏற்பட்டது.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSearch = () => {
        if (!myStar || !myRasi) {
            alert("தயவுசெய்து உங்கள் நட்சத்திரம் மற்றும் இராசியைத் தேர்ந்தெடுக்கவும்.");
            return;
        }

        setIsSearching(true);

        setTimeout(() => {
            const matches = [];

            // We mock a profile for the user
            const myProfile = {
                starId: parseInt(myStar),
                rasiId: parseInt(myRasi)
            };

            // Loop through all 27 stars and 12 rasis (324 combinations)
            STARS.forEach(targetStar => {
                RASIS.forEach(targetRasi => {
                    const targetProfile = {
                        starId: targetStar.id,
                        rasiId: targetRasi.id
                    };

                    // Run the match
                    let matchResult;
                    if (searchType === 'bride') {
                        // Bride looking for Groom
                        matchResult = calculatePorutham(myProfile, targetProfile);
                    } else {
                        // Groom looking for Bride
                        matchResult = calculatePorutham(targetProfile, myProfile);
                    }

                    if (matchResult && matchResult.results) {
                        matches.push({
                            star: targetStar,
                            rasi: targetRasi,
                            percentage: matchResult.summaryReport?.percentage || 0,
                            totalScore: matchResult.summaryReport?.totalScore || 0, // Out of 12
                            importantScore: matchResult.score, // 0-5
                            details: matchResult.results
                        });
                    }
                });
            });

            // Sort by totalScore out of 12 (highest first), then by important score
            matches.sort((a, b) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                if (b.importantScore !== a.importantScore) return b.importantScore - a.importantScore;
                return b.percentage - a.percentage;
            });

            // Keep only top 100 matches that have at least a passable score (e.g., >= 6/12)
            const goodMatches = matches.filter(m => m.totalScore >= 6).slice(0, 100);

            setResults(goodMatches);
            setIsSearching(false);
            setExpandedRow(null); // Reset expansions on new search
        }, 100); // Small timeout to allow UI to show "Searching..." state
    };

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                <Star size={24} color="#fcd34d" /> நட்சத்திர பொருத்தம் தேடல் (Find Matching Stars)
            </h2>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                உங்கள் இராசி மற்றும் நட்சத்திரத்தை உள்ளிட்டு, உங்களுக்குப் பொருத்தமான 100 சிறந்த நட்சத்திரங்கள் மற்றும் இராசிகளை வரிசைக்கிரமமாக (Ranked) கண்டறியவும்.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        <User size={16} style={{ display: 'inline', marginRight: '4px' }} /> நீங்கள் தேடுவது (Looking For)
                    </label>
                    <select
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="bride" style={{ color: 'black' }}>நான் பெண் (ஆண் நட்சத்திரம் தேடுகிறேன்)</option>
                        <option value="groom" style={{ color: 'black' }}>நான் ஆண் (பெண் நட்சத்திரம் தேடுகிறேன்)</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: searchType === 'bride' ? '#f472b6' : '#60a5fa', fontWeight: 'bold' }}>
                        <Moon size={16} style={{ display: 'inline', marginRight: '4px' }} /> உங்கள் இராசி (Your Rasi)
                    </label>
                    <select
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        value={myRasi}
                        onChange={(e) => setMyRasi(e.target.value)}
                    >
                        <option value="" style={{ color: 'black' }}>-- தேர்ந்தெடுக்கவும் --</option>
                        {RASIS.map(r => (
                            <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.nameTamil} ({r.nameEnglish})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: searchType === 'bride' ? '#f472b6' : '#60a5fa', fontWeight: 'bold' }}>
                        <Star size={16} style={{ display: 'inline', marginRight: '4px' }} /> உங்கள் நட்சத்திரம் (Your Star)
                    </label>
                    <select
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        value={myStar}
                        onChange={(e) => setMyStar(e.target.value)}
                    >
                        <option value="" style={{ color: 'black' }}>-- தேர்ந்தெடுக்கவும் --</option>
                        {STARS.map(s => (
                            <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.nameTamil} ({s.nameEnglish})</option>
                        ))}
                    </select>
                </div>

            </div>

            <button
                onClick={handleSearch}
                disabled={isSearching}
                style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '1rem', fontSize: '1.1rem', marginBottom: '2rem' }}
            >
                {isSearching ? 'தேடுகிறது...' : <><Search size={20} style={{ display: 'inline', marginRight: '0.5rem' }} /> பொருத்தமான நட்சத்திரங்களைக் கண்டறி (Find Matches)</>}
            </button>

            {results.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} color="#4ade80" /> சிறந்த பொருத்தங்கள் (Top Matches)
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{results.length} முடிவுகள்</span>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                style={{
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '0.5rem'
                                }}
                            >
                                {isDownloading ? 'தயாராகிறது...' : <><Download size={16} /> PDF பதிவிறக்கு</>}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {results.map((res, index) => {
                            const isExpanded = expandedRow === `${res.star.id}-${res.rasi.id}`;
                            const isExcellent = res.totalScore >= 9;
                            const isGood = res.totalScore >= 7;

                            return (
                                <div key={`${res.star.id}-${res.rasi.id}`} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease-in-out',
                                }}>
                                    {/* Unexpanded Summary Header */}
                                    <div
                                        onClick={() => setExpandedRow(isExpanded ? null : `${res.star.id}-${res.rasi.id}`)}
                                        style={{
                                            padding: '1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            background: isExpanded ? 'rgba(0,0,0,0.2)' : 'transparent',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: searchType === 'bride' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(244, 114, 182, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: searchType === 'bride' ? '#60a5fa' : '#f472b6',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: searchType === 'bride' ? '#60a5fa' : '#f472b6' }}>
                                                    {res.rasi.nameTamil} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'normal' }}>- {res.star.nameTamil}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                color: isExcellent ? '#4ade80' : isGood ? '#fbbf24' : '#f87171'
                                            }}>
                                                {res.totalScore} / 12
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded 12 Porutham View */}
                                    {isExpanded && (
                                        <div style={{ padding: '0', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)' }}>

                                            {/* Header Row */}
                                            <div style={{ display: 'flex', background: '#eab308', color: '#000', padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                <div style={{ width: '40px' }}>வ எண்</div>
                                                <div style={{ flex: 1 }}>பொருத்தம்</div>
                                                <div style={{ width: '60px', textAlign: 'center' }}>நிலை</div>
                                            </div>

                                            {/* Data Rows */}
                                            {[
                                                { id: "dina", label: "தினப் பொருத்தம்", isImportant: false },
                                                { id: "gana", label: "கணப் பொருத்தம்", isImportant: false },
                                                { id: "mahendra", label: "மகேந்திரப் பொருத்தம்", isImportant: true }, // IMPORTANT
                                                { id: "sthree", label: "ஸ்திரீ தீர்க்கம்", isImportant: false },
                                                { id: "yoni", label: "யோனிப் பொருத்தம்", isImportant: true }, // IMPORTANT
                                                { id: "rasi", label: "இராசிப் பொருத்தம்", isImportant: true }, // IMPORTANT
                                                { id: "rasiAthipathi", label: "ராசி அதிபதி பொருத்தம்", isImportant: true }, // IMPORTANT
                                                { id: "vasya", label: "வசியப் பொருத்தம்", isImportant: false },
                                                { id: "rajju", label: "ரஜ்ஜிப் பொருத்தம்", isImportant: true }, // IMPORTANT
                                                { id: "vedhai", label: "வேதைப் பொருத்தம்", isImportant: false },
                                                { id: "nadi", label: "நாடிப் பொருத்தம்", isImportant: false },
                                                { id: "vruksha", label: "விருட்சப் பொருத்தம்", isImportant: false }
                                            ].map((porutham, idx) => {
                                                const matchStatus = res.details[porutham.id]?.status === 'Match';

                                                return (
                                                    <div key={porutham.id} style={{
                                                        display: 'flex',
                                                        padding: '0.75rem 1rem',
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        alignItems: 'center',
                                                        background: porutham.isImportant ? 'rgba(234, 179, 8, 0.05)' : 'transparent' // Highlight important ones slightly
                                                    }}>
                                                        <div style={{ width: '40px', color: 'var(--text-secondary)' }}>{idx + 1}</div>
                                                        <div style={{ flex: 1, fontWeight: porutham.isImportant ? 'bold' : 'normal', color: porutham.isImportant ? '#fbbf24' : 'var(--text-primary)' }}>
                                                            {porutham.label} {porutham.isImportant && <Star size={12} style={{ display: 'inline', marginLeft: '4px' }} />}
                                                        </div>
                                                        <div style={{ width: '60px', textAlign: 'center' }}>
                                                            {matchStatus ?
                                                                <div style={{ background: '#4ade80', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>✓</div>
                                                                :
                                                                <div style={{ background: '#f87171', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>✕</div>
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Summary Footer Row */}
                                            <div style={{ display: 'flex', padding: '1rem', background: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontWeight: 'bold' }}>பொருத்தம் - <span style={{ color: isExcellent ? '#4ade80' : isGood ? '#fbbf24' : '#f87171' }}>{isExcellent ? 'உன்னதம்' : isGood ? 'மத்திமம்' : 'சுமார்'}</span></div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{res.totalScore}</div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchFinder;
