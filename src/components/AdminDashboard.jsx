import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, CheckCircle2, AlertCircle, Mic, MicOff, KeyRound, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = ({ token }) => {
    const [activeTab, setActiveTab] = useState('access');

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

    const tabStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        borderRadius: '2rem',
        background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
        color: isActive ? '#c084fc' : 'var(--text-muted)',
        border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.4)' : 'var(--glass-border)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        fontSize: '0.75rem',
        width: 'auto',
        whiteSpace: 'nowrap'
    });

    return (
        <div style={{ padding: '1rem 0' }}>
            {/* Compact Header */}
            <div className="title-section" style={{ marginBottom: '1rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '1.3rem' }}>
                    <ShieldCheck size={22} color="var(--primary)" /> நிர்வாகி தளம்
                </h1>
                <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>ADMIN DASHBOARD</p>
            </div>

            {/* Compact Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setActiveTab('access')} style={tabStyle(activeTab === 'access')}>
                    <Mic size={14} /> குரல் அனுமதி
                </button>
                <button onClick={() => setActiveTab('recovery')} style={tabStyle(activeTab === 'recovery')}>
                    <KeyRound size={14} /> கடவுச்சொல் மீட்பு
                </button>
            </div>

            {/* Content */}
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', background: 'var(--surface-900)' }}>
                {activeTab === 'access' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Users size={16} color="#c084fc" />
                            <h2 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>அணுகல் கட்டுப்பாடு</h2>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                                {users.length} users
                            </span>
                        </div>

                        {updateError && (
                            <div className="error-message" style={{ marginBottom: '0.75rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                                <AlertCircle size={14} /> {updateError}
                            </div>
                        )}

                        {loadingUsers ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="spin" size={24} color="var(--primary)" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {users.map((u, i) => (
                                    <motion.div
                                        key={u._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '0.75rem',
                                            padding: '0.65rem 0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: u.canUseVoiceAssistant
                                                ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05))'
                                                : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: u.canUseVoiceAssistant ? '#34d399' : '#f87171'
                                        }}>
                                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.82rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email} • {u.mobile}</p>
                                        </div>

                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => toggleVoiceAccess(u._id, u.canUseVoiceAssistant)}
                                            style={{
                                                width: '42px',
                                                height: '24px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: u.canUseVoiceAssistant
                                                    ? 'linear-gradient(135deg, #34d399, #10b981)'
                                                    : 'rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                flexShrink: 0,
                                                padding: 0
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                background: '#fff',
                                                position: 'absolute',
                                                top: '3px',
                                                left: u.canUseVoiceAssistant ? '21px' : '3px',
                                                transition: 'left 0.3s ease',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }} />
                                        </button>
                                    </motion.div>
                                ))}
                                {users.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>பயனர்கள் இல்லை (No users found)</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'recovery' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <h2 style={{ fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>பாதுகாப்பு கேள்வி மீட்பு</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '1rem' }}>
                            கைபேசி / மின்னஞ்சல் மூலம் தேடவும்
                        </p>

                        <form onSubmit={handleRecoverySearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <input
                                    type="text"
                                    placeholder="மின்னஞ்சல் / கைபேசி..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.6rem 0.85rem' }}
                                />
                            </div>
                            <button type="submit" disabled={loadingRecovery || !searchQuery.trim()} style={{ whiteSpace: 'nowrap', width: 'auto', padding: '0 1rem', fontSize: '0.82rem' }}>
                                {loadingRecovery ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
                            </button>
                        </form>

                        {recoveryError && (
                            <div className="error-message" style={{ marginBottom: '1rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                                <AlertCircle size={14} /> {recoveryError}
                            </div>
                        )}

                        {recoveryData && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '120px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>பெயர்</p>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}>{recoveryData.name}</p>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '120px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>கைபேசி</p>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}>{recoveryData.mobile}</p>
                                    </div>
                                </div>

                                <div style={{ paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ color: '#fbbf24', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <ShieldCheck size={14} /> பாதுகாப்பு விவரங்கள்
                                    </h4>

                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>கேள்வி:</p>
                                        <p style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.82rem' }}>
                                            {recoveryData.securityQuestion}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>பதில்:</p>
                                        <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.95rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
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
