import React, { useState } from 'react';
import { History, Sparkles, ArrowLeft, Search, Calendar } from 'lucide-react';
import { calculatePorutham } from '../utils/poruthamLogic';
import PoruthamResult from './PoruthamResult';
import MatchFinder from './MatchFinder';

const Dashboard = ({ savedBrides, savedGrooms, savedMatches, onBack }) => {
    const [quickMatchBride, setQuickMatchBride] = useState('');
    const [quickMatchGroom, setQuickMatchGroom] = useState('');
    const [activeResult, setActiveResult] = useState(null);
    const [activeTab, setActiveTab] = useState('quick-match'); // 'quick-match', 'match-finder', 'history'

    const handleQuickMatch = () => {
        if (!quickMatchBride || !quickMatchGroom) {
            alert("தயவுசெய்து ஆண் மற்றும் பெண் இருவரையும் தேர்ந்தெடுக்கவும்.");
            return;
        }

        const bData = savedBrides.find(b => b._id === quickMatchBride)?.profileData;
        const gData = savedGrooms.find(g => g._id === quickMatchGroom)?.profileData;

        if (bData && gData) {
            const matchResult = calculatePorutham(bData, gData);
            setActiveResult({ ...matchResult, bride: bData, groom: gData });
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    };

    const loadSavedMatch = (match) => {
        setActiveResult({
            ...match.result,
            bride: match.brideData,
            groom: match.groomData
        });
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <button
                onClick={onBack}
                style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}
            >
                <ArrowLeft size={16} /> பின்செல்ல (Back)
            </button>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '1rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('quick-match')}
                    style={{ flex: 1, whiteSpace: 'nowrap', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'quick-match' ? 'var(--primary)' : 'transparent', color: activeTab === 'quick-match' ? 'white' : 'var(--text-secondary)' }}
                >
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> விரைவுப் பொருத்தம்
                </button>
                <button
                    onClick={() => setActiveTab('match-finder')}
                    style={{ flex: 1, whiteSpace: 'nowrap', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'match-finder' ? 'var(--primary)' : 'transparent', color: activeTab === 'match-finder' ? 'white' : 'var(--text-secondary)' }}
                >
                    <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> நட்சத்திரம் தேடல்
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{ flex: 1, whiteSpace: 'nowrap', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'history' ? 'var(--primary)' : 'transparent', color: activeTab === 'history' ? 'white' : 'var(--text-secondary)' }}
                >
                    <History size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> சேமிக்கப்பட்டவை
                </button>
            </div>

            {/* Quick Match Tab */}
            {activeTab === 'quick-match' && (
                <>
                    <div className="glass-card">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            <Sparkles size={24} color="#fbbf24" /> விரைவுப் பொருத்தம் (Quick Match Engine)
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f472b6', fontWeight: 'bold' }}>பெண் (Bride)</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244, 114, 182, 0.3)', color: 'white' }}
                                    value={quickMatchBride}
                                    onChange={(e) => setQuickMatchBride(e.target.value)}
                                >
                                    <option value="" style={{ color: 'black', background: 'white' }}>தேர்ந்தெடுக்கவும்...</option>
                                    {savedBrides.map(b => (
                                        <option key={b._id} value={b._id} style={{ color: 'black', background: 'white' }}>{b.profileData.name} ({b.profileData.rasiId ? 'கட்டம் கணக்கிடப்பட்டது' : 'நட்சத்திரம் மட்டும்'})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#60a5fa', fontWeight: 'bold' }}>ஆண் (Groom)</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96, 165, 250, 0.3)', color: 'white' }}
                                    value={quickMatchGroom}
                                    onChange={(e) => setQuickMatchGroom(e.target.value)}
                                >
                                    <option value="" style={{ color: 'black', background: 'white' }}>தேர்ந்தெடுக்கவும்...</option>
                                    {savedGrooms.map(g => (
                                        <option key={g._id} value={g._id} style={{ color: 'black', background: 'white' }}>{g.profileData.name} ({g.profileData.rasiId ? 'கட்டம் கணக்கிடப்பட்டது' : 'நட்சத்திரம் மட்டும்'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleQuickMatch}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                        >
                            <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> பொருத்தம் காண்க (Match!)
                        </button>
                    </div>

                    {activeResult && (
                        <div style={{ marginTop: '2rem' }}>
                            <PoruthamResult data={activeResult} />
                        </div>
                    )}
                </>
            )}

            {/* Match Finder Tab */}
            {activeTab === 'match-finder' && (
                <MatchFinder />
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <History size={20} /> சேமிக்கப்பட்ட பொருத்தங்கள் (Saved History)
                    </h3>

                    {savedMatches && savedMatches.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {savedMatches.map(match => (
                                <div
                                    key={match._id}
                                    onClick={() => loadSavedMatch(match)}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{match.brideName}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>&times;</span>
                                            <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{match.groomName}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={12} /> {new Date(match.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: match.result?.summaryReport?.percentage > 50 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                        color: match.result?.summaryReport?.percentage > 50 ? '#4ade80' : '#f87171',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {match.result?.summaryReport?.percentage || 0}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                            நீங்கள் இதுவரை எந்தப் பொருத்தங்களையும் சேமிக்கவில்லை.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
