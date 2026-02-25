import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldQuestion, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = ({ onBack }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: Answer Question, 3: Reset Password

    // Form States
    const [identifier, setIdentifier] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    // UI States
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetQuestion = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`/api/auth/forgot-password/question/${identifier}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to fetch user');

            setQuestion(data.securityQuestion);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAnswer = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, securityAnswer: answer })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');

            setResetToken(data.resetToken);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Reset failed');

            setSuccess('கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! (Password Reset Successful)');
            setTimeout(() => {
                onBack();
            }, 3000);
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
                style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}
            >
                <button
                    onClick={onBack}
                    style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0, cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', color: '#38bdf8', marginBottom: '1rem' }}>
                        {step === 3 ? <Lock size={32} /> : step === 2 ? <ShieldQuestion size={32} /> : <Mail size={32} />}
                    </div>
                    <h2>கடவுச்சொல் மீட்பு</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {step === 1 ? 'Enter your registered email' : step === 2 ? 'Answer your security question' : 'Set a new password'}
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{ padding: '0.75rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '0.5rem', color: '#34d399', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleGetQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label><Mail size={16} /> மின்னஞ்சல் அல்லது கைபேசி (Email or Mobile)</label>
                            <input
                                type="text"
                                placeholder="example@mail.com or 9876543210"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'சரிபார்க்கப்படுகிறது...' : 'தொடர்க (Continue)'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label style={{ lineHeight: '1.4', color: 'var(--primary)' }}>
                                <ShieldQuestion size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                {question}
                            </label>
                            <input
                                type="text"
                                placeholder="உங்கள் பதில் (Your Answer)"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'சரிபார்க்கப்படுகிறது...' : 'உறுதி செய் (Verify)'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label><Lock size={16} /> புதிய கடவுச்சொல் (New Password)</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" disabled={loading || success} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'மாற்றப்படுகிறது...' : 'கடவுச்சொல்லை மாற்று (Reset Password)'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
