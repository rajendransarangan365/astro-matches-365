import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, AlertCircle, Mic, MicOff, KeyRound, Users, ChevronDown, Trash2, Crown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = ({ token }) => {
    const [activeTab, setActiveTab] = useState('access');
    const [expandedUser, setExpandedUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Access Control State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [updateError, setUpdateError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

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

    // Auto-clear messages
    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    useEffect(() => {
        if (updateError) {
            const t = setTimeout(() => setUpdateError(''), 5000);
            return () => clearTimeout(t);
        }
    }, [updateError]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUpdateError('');
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ canUseVoiceAssistant: !currentAccess })
            });
            if (!res.ok) throw new Error('Failed to update access');
            setUsers(users.map(u => u._id === userId ? { ...u, canUseVoiceAssistant: !currentAccess } : u));
        } catch (error) {
            setUpdateError('குரல் அனுமதி மாற்றத்தில் பிழை');
            console.error(error);
        }
    };

    const toggleAdminAccess = async (userId, currentAdmin) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/admin-access`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isAdmin: !currentAdmin })
            });
            if (!res.ok) throw new Error('Failed to update admin access');
            setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: !currentAdmin } : u));
            setSuccessMsg(!currentAdmin ? 'நிர்வாகியாக மாற்றப்பட்டது' : 'நிர்வாகி நீக்கப்பட்டது');
        } catch (error) {
            setUpdateError('நிர்வாகி அனுமதி மாற்றத்தில் பிழை');
            console.error(error);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete user');
            setUsers(users.filter(u => u._id !== userId));
            setDeleteConfirm(null);
            setExpandedUser(null);
            setSuccessMsg('பயனர் நீக்கப்பட்டார்');
        } catch (error) {
            setUpdateError('பயனர் நீக்குவதில் பிழை');
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
                headers: { 'Authorization': `Bearer ${token}` }
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
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        transition: 'all 0.3s ease', cursor: 'pointer',
        fontSize: '0.75rem', width: 'auto', whiteSpace: 'nowrap'
    });

    // Toggle switch component
    const Toggle = ({ on, onToggle, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                style={{
                    width: '38px', height: '22px', borderRadius: '11px', border: 'none',
                    background: on ? 'linear-gradient(135deg, #34d399, #10b981)' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease',
                    flexShrink: 0, padding: 0
                }}
            >
                <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px', left: on ? '19px' : '3px',
                    transition: 'left 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
            </button>
        </div>
    );

    return (
        <div style={{ padding: '1rem 0' }}>
            {/* Header */}
            <div className="title-section" style={{ marginBottom: '1rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '1.3rem' }}>
                    <ShieldCheck size={22} color="var(--primary)" /> நிர்வாகி தளம்
                </h1>
                <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>ADMIN DASHBOARD</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setActiveTab('access')} style={tabStyle(activeTab === 'access')}>
                    <Users size={14} /> பயனர் நிர்வாகம்
                </button>
                <button onClick={() => setActiveTab('recovery')} style={tabStyle(activeTab === 'recovery')}>
                    <KeyRound size={14} /> கடவுச்சொல் மீட்பு
                </button>
            </div>

            {/* Content */}
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', background: 'var(--surface-900)' }}>
                {activeTab === 'access' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Users size={16} color="#c084fc" />
                            <h2 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>பயனர் பட்டியல்</h2>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                                {users.length} users
                            </span>
                        </div>

                        {/* Messages */}
                        <AnimatePresence>
                            {updateError && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="error-message" style={{ marginBottom: '0.75rem', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                                    <AlertCircle size={14} /> {updateError}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: '0.75rem', fontSize: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.5rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <ShieldCheck size={14} /> {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {loadingUsers ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="spin" size={24} color="var(--primary)" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {users.map((u, i) => {
                                    const isExpanded = expandedUser === u._id;
                                    return (
                                        <motion.div
                                            key={u._id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                background: isExpanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${isExpanded ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                                borderRadius: '0.75rem',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {/* User Row - Clickable */}
                                            <div
                                                onClick={() => setExpandedUser(isExpanded ? null : u._id)}
                                                style={{
                                                    padding: '0.6rem 0.85rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: u.isAdmin
                                                        ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))'
                                                        : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, fontSize: '0.75rem', fontWeight: '600',
                                                    color: u.isAdmin ? '#fbbf24' : '#a78bfa',
                                                    position: 'relative'
                                                }}>
                                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                    {u.isAdmin && (
                                                        <Crown size={10} style={{
                                                            position: 'absolute', top: '-4px', right: '-4px',
                                                            color: '#fbbf24', fill: '#fbbf24'
                                                        }} />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        <p style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.82rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                                                        {u.isAdmin && (
                                                            <span style={{ fontSize: '0.55rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', fontWeight: '600', flexShrink: 0 }}>ADMIN</span>
                                                        )}
                                                    </div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email} • {u.mobile}</p>
                                                </div>

                                                {/* Expand Arrow */}
                                                <ChevronDown size={16} style={{
                                                    color: 'var(--text-muted)', flexShrink: 0,
                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                                    transition: 'transform 0.2s ease'
                                                }} />
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{ padding: '0 0.85rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                            {/* User Details */}
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.65rem 0' }}>
                                                                <div>
                                                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>மின்னஞ்சல்</p>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{u.email}</p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>கைபேசி</p>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{u.mobile || '—'}</p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>பங்கு</p>
                                                                    <p style={{ fontSize: '0.75rem', color: u.isAdmin ? '#fbbf24' : 'var(--text-primary)', fontWeight: u.isAdmin ? '600' : '400' }}>
                                                                        {u.isAdmin ? '🛡️ நிர்வாகி (Admin)' : '👤 பயனர் (User)'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>பாதுகாப்பு</p>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                                                                        {u.securityQuestion ? '✅ அமைக்கப்பட்டது' : '❌ அமைக்கவில்லை'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Toggle Controls */}
                                                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                                                                <Toggle
                                                                    on={u.canUseVoiceAssistant}
                                                                    onToggle={() => toggleVoiceAccess(u._id, u.canUseVoiceAssistant)}
                                                                    label={<><Mic size={12} style={{ marginRight: '0.3rem' }} /> குரல் ஏஐ அனுமதி</>}
                                                                />
                                                                <Toggle
                                                                    on={u.isAdmin}
                                                                    onToggle={() => toggleAdminAccess(u._id, u.isAdmin)}
                                                                    label={<><Crown size={12} style={{ marginRight: '0.3rem' }} /> நிர்வாகி அனுமதி</>}
                                                                />
                                                            </div>

                                                            {/* Delete Button */}
                                                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                                                {deleteConfirm === u._id ? (
                                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                        <p style={{ fontSize: '0.72rem', color: '#f87171', flex: 1, margin: 0 }}>நிச்சயமாக நீக்கவா?</p>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); deleteUser(u._id); }}
                                                                            style={{
                                                                                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                                                                                border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.75rem',
                                                                                borderRadius: '0.5rem', fontSize: '0.72rem', width: 'auto'
                                                                            }}
                                                                        >ஆம், நீக்கு</button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                                                                            style={{
                                                                                background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                                                                                border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem',
                                                                                borderRadius: '0.5rem', fontSize: '0.72rem', width: 'auto'
                                                                            }}
                                                                        >வேண்டாம்</button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(u._id); }}
                                                                        style={{
                                                                            background: 'transparent', color: '#f87171',
                                                                            border: 'none', padding: '0.3rem 0',
                                                                            fontSize: '0.72rem', width: 'auto',
                                                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                                            opacity: 0.7
                                                                        }}
                                                                    >
                                                                        <Trash2 size={13} /> பயனரை நீக்கு (Delete User)
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
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
