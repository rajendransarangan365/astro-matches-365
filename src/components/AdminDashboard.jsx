import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, CheckCircle2, AlertCircle, Mic, MicOff, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = ({ token }) => {
    const [activeTab, setActiveTab] = useState('access'); // 'access' or 'recovery'

    // Access Control State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [updateError, setUpdateError] = useState('');

    // Recovery State
    const [searchQuery, setSearchQuery] = useState('');
    const [recoveryData, setRecoveryData] = useState(null);
    const [loadingRecovery, setLoadingRecovery] = useState(false);
    const [recoveryError, setRecoveryError] = useState('');

    useEffect(() => {
        if (activeTab === 'access') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUpdateError('');
        try {
            const res = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            setUpdateError('பயனர்களைப் பெறுவதில் பிழை (Error fetching users)');
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleVoiceAccess = async (userId, currentAccess) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/voice-access`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ canUseVoiceAssistant: !currentAccess })
            });

            if (!res.ok) throw new Error('Failed to update access');

            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, canUseVoiceAssistant: !currentAccess } : u));
        } catch (error) {
            setUpdateError('அனுமதியை மாற்றுவதில் பிழை (Error toggling access)');
            console.error(error);
        }
    };

    const handleRecoverySearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoadingRecovery(true);
        setRecoveryError('');
        setRecoveryData(null);

        try {
            const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Search failed');

            setRecoveryData(data);
        } catch (error) {
            setRecoveryError(error.message || 'தேடல் தோல்வியடைந்தது');
        } finally {
            setLoadingRecovery(false);
        }
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="title-section" style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={32} color="var(--primary)" /> நிர்வாகி தளம்
                </h1>
                <p>Admin Dashboard</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('access')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '2rem',
                        background: activeTab === 'access' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                        color: activeTab === 'access' ? '#c084fc' : 'var(--text-muted)',
                        border: `1px solid ${activeTab === 'access' ? 'rgba(168, 85, 247, 0.4)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        width: 'auto',
                        minWidth: 'fit-content'
                    }}
                    onMouseOver={(e) => { if (activeTab !== 'access') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                    onMouseOut={(e) => { if (activeTab !== 'access') { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                    <Mic size={18} /> ஏஐ குரல் அனுமதி (Voice Access)
                </button>
                <button
                    onClick={() => setActiveTab('recovery')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '2rem',
                        background: activeTab === 'recovery' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                        color: activeTab === 'recovery' ? '#c084fc' : 'var(--text-muted)',
                        border: `1px solid ${activeTab === 'recovery' ? 'rgba(168, 85, 247, 0.4)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        width: 'auto',
                        minWidth: 'fit-content'
                    }}
                    onMouseOver={(e) => { if (activeTab !== 'recovery') { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                    onMouseOut={(e) => { if (activeTab !== 'recovery') { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                    <KeyRound size={18} /> கடவுச்சொல் மீட்பு (Password Recovery)
                </button>
            </div>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--surface-900)' }}>
                {activeTab === 'access' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>ஏஐ ஜோதிடர் அணுகல் கட்டுப்பாடு</h2>
                        {updateError && (
                            <div className="error-message" style={{ marginBottom: '1rem' }}>
                                <AlertCircle size={18} /> {updateError}
                            </div>
                        )}

                        {loadingUsers ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="spin" size={32} color="var(--primary)" />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>பெயர் (Name)</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>மின்னஞ்சல் (Email)</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>கைபேசி (Mobile)</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>அனுமதி (Access)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>{u.name}</td>
                                                <td style={{ padding: '1rem' }}>{u.email}</td>
                                                <td style={{ padding: '1rem' }}>{u.mobile}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => toggleVoiceAccess(u._id, u.canUseVoiceAssistant)}
                                                        style={{
                                                            background: u.canUseVoiceAssistant ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: u.canUseVoiceAssistant ? '#34d399' : '#f87171',
                                                            border: `1px solid ${u.canUseVoiceAssistant ? '#34d399' : '#f87171'}`,
                                                            padding: '0.4rem 1rem',
                                                            borderRadius: '2rem',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {u.canUseVoiceAssistant ? <><Mic size={16} /> உள்ளது</> : <><MicOff size={16} /> இல்லை</>}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>பயனர்கள் இல்லை (No users found)</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'recovery' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>பயனர் பாதுகாப்பு கேள்வி மீட்பு</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                            கைபேசி அல்லது மின்னஞ்சலை வைத்துப் பயனரின் பாதுகாப்புக் கேள்வியைத் தேடவும். (Search by mobile or email)
                        </p>

                        <form onSubmit={handleRecoverySearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <input
                                    type="text"
                                    placeholder="மின்னஞ்சல் அல்லது கைபேசி எண்..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <button type="submit" disabled={loadingRecovery || !searchQuery.trim()} style={{ whiteSpace: 'nowrap', width: 'auto', padding: '0 2rem' }}>
                                {loadingRecovery ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
                                தேடு (Search)
                            </button>
                        </form>

                        {recoveryError && (
                            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
                                <AlertCircle size={18} /> {recoveryError}
                            </div>
                        )}

                        {recoveryData && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>பெயர் (Name)</p>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{recoveryData.name}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>கைபேசி (Mobile)</p>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{recoveryData.mobile}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
                                    <h4 style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={16} /> பாதுகாப்பு விவரங்கள்
                                    </h4>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>கேள்வி (Question):</p>
                                        <p style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                            {recoveryData.securityQuestion}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>பதில் (Answer):</p>
                                        <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                            {recoveryData.securityAnswer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
