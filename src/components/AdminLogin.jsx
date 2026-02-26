import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

const AdminLogin = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Admin login failed');

            const { token: userToken, ...userData } = data;
            login(userData, userToken);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    border: '1px solid rgba(168, 85, 247, 0.4)', // Purple border to distinguish from normal login
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(168, 85, 247, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '50%', color: '#c084fc', marginBottom: '1rem', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
                        <ShieldCheck size={36} />
                    </div>
                    <h2 style={{ color: '#c084fc', marginBottom: '0.25rem' }}>நிர்வாகி தளம்</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Portal Login</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label><Mail size={16} /> மின்னஞ்சல் (Admin Email)</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ borderColor: 'rgba(168, 85, 247, 0.2)', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> கடவுச்சொல் (Password)</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ borderColor: 'rgba(168, 85, 247, 0.2)', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        {loading ? 'சரிபார்க்கப்படுகிறது...' : 'நிர்வாகியாக உள்நுழை (Admin Login)'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <button
                        type="button"
                        onClick={onBack}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '2rem' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        ← சாதாரண பயனராக உள்நுழைய (Return to Standard Login)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
