import React, { useState } from 'react';
import { STARS, RASIS } from '../data/poruthamData';
import { calculatePorutham } from '../utils/poruthamLogic';
import { Search, Star, User, Moon, CheckCircle2, XCircle, TrendingUp, Filter } from 'lucide-react';

const MatchFinder = () => {
    const [searchType, setSearchType] = useState('bride'); // 'bride' looking for groom, or 'groom' looking for bride
    const [myStar, setMyStar] = useState('');
    const [myRasi, setMyRasi] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
                            importantScore: matchResult.score, // 0-5
                            details: matchResult.results
                        });
                    }
                });
            });

            // Sort by percentage (highest first), then by important score
            matches.sort((a, b) => {
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                return b.importantScore - a.importantScore;
            });

            // Keep only top 50 matches to prevent UI lag, or filter out terrible ones
            const goodMatches = matches.filter(m => m.percentage >= 50).slice(0, 100);

            setResults(goodMatches);
            setIsSearching(false);
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{results.length} முடிவுகள்</span>
                    </div>

                    <div style={{ overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem', color: '#94a3b8' }}>தரவரிசை (Rank)</th>
                                    <th style={{ padding: '1rem', color: '#f8fafc' }}>பொருத்தமான நட்சத்திரம் & இராசி</th>
                                    <th style={{ padding: '1rem', color: '#4ade80' }}>மொத்த பொருத்தம் (%)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>ராசி<br />(வம்சம்)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>ராசியதிபதி<br />(ஒற்றுமை)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#fca5a5' }}>ரஜ்ஜு<br />(ஆயுள்!)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>மகேந்திரம்<br />(குழந்தை)</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>யோனி<br />(தாம்பத்தியம்)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((res, index) => (
                                    <tr key={`${res.star.id}-${res.rasi.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.1)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: index < 3 ? '#fbbf24' : 'var(--text-secondary)' }}>
                                            #{index + 1}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{res.star.nameTamil} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({res.star.nameEnglish})</span></div>
                                            <div style={{ fontSize: '0.85rem', color: searchType === 'bride' ? '#60a5fa' : '#f472b6' }}>{res.rasi.nameTamil}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: res.percentage >= 70 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                                                color: res.percentage >= 70 ? '#4ade80' : '#facc15',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {res.percentage}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {res.details.rasi.status === 'Match' ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#f87171" opacity={0.5} />}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {res.details.rasiAthipathi.status === 'Match' ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#f87171" opacity={0.5} />}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', background: 'rgba(248, 113, 113, 0.05)' }}>
                                            {res.details.rajju.status === 'Match' ? <CheckCircle2 size={20} color="#4ade80" /> : <XCircle size={20} color="#ef4444" />}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {res.details.mahendra.status === 'Match' ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#f87171" opacity={0.5} />}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {res.details.yoni.status === 'Match' ? <CheckCircle2 size={18} color="#4ade80" /> : <XCircle size={18} color="#f87171" opacity={0.5} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchFinder;
