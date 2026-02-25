import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldQuestion, PenTool, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
    const { user, token } = useAuth();

    const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || 'உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன?');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    React.useEffect(() => {
        if (isOpen && token) {
            const fetchSecurityDetails = async () => {
                try {
                    const response = await fetch('/api/auth/security-details', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.securityQuestion) {
                            setSecurityQuestion(data.securityQuestion);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch security details", err);
                }
            };
            fetchSecurityDetails();
        }
    }, [isOpen, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/update-security', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ securityQuestion, securityAnswer, mobile })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'புதுப்பிப்பதில் பிழை (Update failed)');

            setSuccess(data.message);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-card"
                    style={{ width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden' }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', color: '#38bdf8', marginBottom: '1rem' }}>
                            <User size={40} />
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{user?.name}</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
                        {user?.mobile && <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>+91 {user?.mobile}</p>}
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldQuestion size={18} color="var(--primary)" />
                            பாதுகாப்பு விவரங்கள் (Security)
                        </h3>

                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '0.75rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '0.5rem', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} /> {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label><User size={14} /> மொபைல் எண் (Mobile)</label>
                                <input
                                    type="tel"
                                    placeholder="உங்கள் மொபைல் எண்"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div className="input-group">
                                <label><ShieldQuestion size={14} /> பாதுகாப்பு கேள்வி (Security Question)</label>
                                <select
                                    value={securityQuestion}
                                    onChange={(e) => setSecurityQuestion(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem',
                                        color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன?" style={{ background: '#0a0e1a' }}>உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன? (Favorite Pet)</option>
                                    <option value="நீங்கள் பிறந்த ஊர் எது?" style={{ background: '#0a0e1a' }}>நீங்கள் பிறந்த ஊர் எது? (Birth City)</option>
                                    <option value="உங்கள் சிறுவயது செல்லப்பெயர் என்ன?" style={{ background: '#0a0e1a' }}>உங்கள் சிறுவயது செல்லப்பெயர் என்ன? (Childhood Nickname)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label><PenTool size={14} /> புதிய பதில் (New Answer)</label>
                                <input
                                    type="text"
                                    placeholder="உங்கள் புதிய பதில்"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    required
                                    style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                                />
                            </div>

                            <button type="submit" disabled={loading || success} style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
                                {loading ? 'புதுப்பிக்கப்படுகிறது...' : 'புதுப்பி (Update Security)'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileSettingsModal;
