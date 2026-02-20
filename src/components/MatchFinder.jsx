import React, { useState, useRef } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { calculatePorutham } from '../utils/poruthamLogic';
import { Search, Star, User, Moon, CheckCircle2, XCircle, TrendingUp, Filter, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const MatchFinder = () => {
    const [searchType, setSearchType] = useState('bride'); // 'bride' looking for groom, or 'groom' looking for bride
    const [myStar, setMyStar] = useState('');
    const [myRasi, setMyRasi] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null); // Tracks which result card is opened
    const printRef = useRef(null);

    const selectedStarObj = STARS.find(s => s.id === parseInt(myStar));
    const availableRasis = selectedStarObj
        ? RASIS.filter(r => selectedStarObj.rasiMapping.some(rm => rm.rasiId === r.id))
        : RASIS;

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);

        try {
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // 1. Capture Title
            const titleNode = printRef.current.querySelector('.print-title');
            const titleCanvas = await html2canvas(titleNode, { scale: 2, backgroundColor: '#ffffff' });
            const titleImg = titleCanvas.toDataURL('image/png');
            const titleHeight = ((pdfWidth - 40) * titleCanvas.height) / titleCanvas.width;

            pdf.addImage(titleImg, 'PNG', 20, 20, pdfWidth - 40, titleHeight);
            let currentY = 20 + titleHeight + 20;

            // 2. Capture Each Match Card
            const cards = printRef.current.querySelectorAll('.print-match-card');
            for (let i = 0; i < cards.length; i++) {
                const canvas = await html2canvas(cards[i], { scale: 2, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                const imgRatio = canvas.height / canvas.width;
                const printWidth = pdfWidth - 40;
                const printHeight = printWidth * imgRatio;

                // Check if card fits on remaining page height. If not, add new page.
                if (currentY + printHeight > pdf.internal.pageSize.getHeight() - 20) {
                    pdf.addPage();
                    currentY = 20; // reset to top
                }

                pdf.addImage(imgData, 'PNG', 20, currentY, printWidth, printHeight);
                currentY += printHeight + 20; // 20px gap
            }

            const fileName = searchType === 'bride'
                ? `Thirumana_Porutham_For_Bride_${Date.now()}.pdf`
                : `Thirumana_Porutham_For_Groom_${Date.now()}.pdf`;

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

            // Loop through all 27 stars but ONLY their valid Rasis based on Padas
            STARS.forEach(targetStar => {
                targetStar.rasiMapping.forEach(mapping => {
                    const targetRasi = RASIS.find(r => r.id === mapping.rasiId);
                    if (!targetRasi) return;

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
                            details: matchResult.results,
                            padas: mapping.padas // Store the specific padas for display
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

            // Keep only top 10 matches that have at least a passable score (e.g., >= 6/12)
            const goodMatches = matches.filter(m => m.totalScore >= 6).slice(0, 10);

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
                உங்கள் இராசி மற்றும் நட்சத்திரத்தை உள்ளிட்டு, உங்களுக்குப் பொருத்தமான 10 சிறந்த நட்சத்திரங்கள் மற்றும் இராசிகளை வரிசைக்கிரமமாக (Ranked) கண்டறியவும்.
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
                        <Star size={16} style={{ display: 'inline', marginRight: '4px' }} /> உங்கள் நட்சத்திரம் (Your Star)
                    </label>
                    <select
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        value={myStar}
                        onChange={(e) => {
                            const newStarId = e.target.value;
                            setMyStar(newStarId);
                            // Auto reset/select Rasi based on new star
                            const newStarObj = STARS.find(s => s.id === parseInt(newStarId));
                            if (newStarObj) {
                                if (newStarObj.rasiMapping.length === 1) {
                                    setMyRasi(newStarObj.rasiMapping[0].rasiId.toString());
                                } else if (!newStarObj.rasiMapping.some(rm => rm.rasiId === parseInt(myRasi))) {
                                    setMyRasi('');
                                }
                            }
                        }}
                    >
                        <option value="" style={{ color: 'black' }}>-- தேர்ந்தெடுக்கவும் --</option>
                        {STARS.map(s => (
                            <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.nameTamil}</option>
                        ))}
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
                        {availableRasis.map(r => {
                            const padas = selectedStarObj ? selectedStarObj.rasiMapping.find(rm => rm.rasiId === r.id)?.padas : "";
                            const padaText = padas ? ` (பாதம் ${padas})` : "";
                            return (
                                <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.nameTamil}{padaText}</option>
                            );
                        })}
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
                                                    {res.rasi.nameTamil} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'normal' }}>- {res.star.nameTamil} (பாதம் {res.padas})</span>
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

            {/* --- HIDDEN PRINTABLE UI FOR PDF GENERATION --- */}
            {results.length > 0 && (
                <div style={{ position: 'absolute', top: '-20000px', left: '-20000px', width: '800px', pointerEvents: 'none' }}>
                    <div ref={printRef} style={{ background: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'sans-serif' }}>

                        <div className="print-title" style={{ background: '#ffffff', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb', marginBottom: '30px' }}>
                            <h1 style={{ textAlign: 'center', color: '#6d28d9', margin: '0 0 10px 0', fontSize: '28px' }}>
                                {searchType === 'bride' ? "பெண்" : "ஆண்"} திருமணப் பொருத்த முடிவுகள் (10 சிறந்த பொருத்தங்கள்)
                            </h1>
                            <h3 style={{ textAlign: 'center', margin: 0, color: '#4b5563', fontSize: '18px' }}>
                                (உங்கள் நட்சத்திரம்: {selectedStarObj?.nameTamil} - இராசி: {RASIS.find(r => r.id === parseInt(myRasi))?.nameTamil})
                            </h3>
                        </div>

                        {results.map((res, index) => {
                            const isExcellent = res.totalScore >= 9;
                            const isGood = res.totalScore >= 7;

                            return (
                                <div key={`print-${res.star.id}-${res.rasi.id}`} className="print-match-card" style={{ marginBottom: '40px', border: '2px solid #e5e7eb', borderRadius: '12px', background: '#ffffff' }}>

                                    {/* Header */}
                                    <div style={{ background: isExcellent ? '#dcfce7' : isGood ? '#fef3c7' : '#fee2e2', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                                            #{index + 1} {res.rasi.nameTamil} - {res.star.nameTamil} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>(பாதம் {res.padas})</span>
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: isExcellent ? '#166534' : isGood ? '#b45309' : '#991b1b' }}>
                                            மதிப்பெண்: {res.totalScore} / 12 ({isExcellent ? 'உன்னதம்' : isGood ? 'மத்திமம்' : 'சுமார்'})
                                        </div>
                                    </div>

                                    {/* 12 Poruthams Table */}
                                    <div style={{ padding: '0' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb' }}>
                                                    <th style={{ padding: '12px 25px', borderBottom: '2px solid #e5e7eb', color: '#374151', width: '60px' }}>எண்</th>
                                                    <th style={{ padding: '12px 25px', borderBottom: '2px solid #e5e7eb', color: '#374151', flex: 1 }}>பொருத்தம்</th>
                                                    <th style={{ padding: '12px 25px', borderBottom: '2px solid #e5e7eb', color: '#374151', textAlign: 'center', width: '150px' }}>நிலை</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { id: "dina", label: "தினப் பொருத்தம்", isImportant: false },
                                                    { id: "gana", label: "கணப் பொருத்தம்", isImportant: false },
                                                    { id: "mahendra", label: "மகேந்திரப் பொருத்தம்", isImportant: true },
                                                    { id: "sthree", label: "ஸ்திரீ தீர்க்கம்", isImportant: false },
                                                    { id: "yoni", label: "யோனிப் பொருத்தம்", isImportant: true },
                                                    { id: "rasi", label: "இராசிப் பொருத்தம்", isImportant: true },
                                                    { id: "rasiAthipathi", label: "ராசி அதிபதி பொருத்தம்", isImportant: true },
                                                    { id: "vasya", label: "வசியப் பொருத்தம்", isImportant: false },
                                                    { id: "rajju", label: "ரஜ்ஜிப் பொருத்தம்", isImportant: true },
                                                    { id: "vedhai", label: "வேதைப் பொருத்தம்", isImportant: false },
                                                    { id: "nadi", label: "நாடிப் பொருத்தம்", isImportant: false },
                                                    { id: "vruksha", label: "விருட்சப் பொருத்தம்", isImportant: false }
                                                ].map((porutham, idx) => {
                                                    const matchStatus = res.details[porutham.id]?.status === 'Match';
                                                    return (
                                                        <tr key={porutham.id} style={{ background: porutham.isImportant ? '#fefce8' : '#ffffff' }}>
                                                            <td style={{ padding: '10px 25px', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                                                                {idx + 1}
                                                            </td>
                                                            <td style={{ padding: '10px 25px', borderBottom: '1px solid #f3f4f6', fontWeight: porutham.isImportant ? 'bold' : 'normal', color: porutham.isImportant ? '#a16c00' : '#111827', fontSize: '16px' }}>
                                                                {porutham.label} {porutham.isImportant && "⭐ (முக்கியம்)"}
                                                            </td>
                                                            <td style={{ padding: '10px 25px', borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: matchStatus ? '#059669' : '#dc2626' }}>
                                                                {matchStatus ? '✅ உண்டு' : '❌ இல்லை'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

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
