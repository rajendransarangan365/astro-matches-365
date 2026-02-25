import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, ShieldQuestion, PenTool, Phone } from 'lucide-react';

const SignupPage = ({ onSwitch }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன?');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, mobile, password, securityQuestion, securityAnswer })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Signup failed');

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                        <UserPlus size={32} />
                    </div>
                    <h2>புதிய கணக்கு</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Create a new account</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label><User size={16} /> பெயர் (Name)</label>
                        <input
                            type="text"
                            placeholder="உங்கள் பெயர்"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Mail size={16} /> மின்னஞ்சல் (Email)</label>
                        <input
                            type="email"
                            placeholder="example@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Phone size={16} /> கைபேசி எண் (Mobile No)</label>
                        <input
                            type="tel"
                            placeholder="உங்கள் கைபேசி எண்"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
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
                        />
                    </div>

                    <div className="input-group">
                        <label><ShieldQuestion size={16} /> பாதுகாப்பு கேள்வி (Security Question)</label>
                        <select
                            value={securityQuestion}
                            onChange={(e) => setSecurityQuestion(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem',
                                color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன?" style={{ background: '#0a0e1a' }}>உங்களுக்கு பிடித்த செல்லப்பிராணியின் பெயர் என்ன? (Favorite Pet)</option>
                            <option value="நீங்கள் பிறந்த ஊர் எது?" style={{ background: '#0a0e1a' }}>நீங்கள் பிறந்த ஊர் எது? (Birth City)</option>
                            <option value="உங்கள் சிறுவயது செல்லப்பெயர் என்ன?" style={{ background: '#0a0e1a' }}>உங்கள் சிறுவயது செல்லப்பெயர் என்ன? (Childhood Nickname)</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><PenTool size={16} /> பதில் (Answer)</label>
                        <input
                            type="text"
                            placeholder="உங்கள் பதில் (Your Answer)"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'பதிவு செய்யப்படுகிறது...' : 'பதிவு செய் (Sign Up)'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ஏற்கனவே கணக்கு உள்ளதா?{' '}
                    <button
                        type="button"
                        onClick={onSwitch}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: 0, fontWeight: 'bold' }}
                    >
                        உள்நுழைக (Login)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
