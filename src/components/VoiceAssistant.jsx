import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Volume2, Square, Loader2, Sparkles, MessageCircle, AlertCircle, X, Wand2, Stars } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const VoiceAssistant = ({ matchData }) => {
    const { user } = useAuth();

    // Check authorization: Must be logged in, and either an Admin or explicitly granted Voice Access
    const isAuthorized = user && (user.isAdmin || user.canUseVoiceAssistant);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [hasSupport, setHasSupport] = useState(true);
    const [highlightIndices, setHighlightIndices] = useState({ start: 0, end: 0 });

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const audioContextRef = useRef(null);
    const responseScrollRef = useRef(null);

    // Helper to play simple synthesized tones
    const playTone = (frequency, duration, type = 'sine') => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };


    useEffect(() => {
        // Initialize Speech Recognition once on mount
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && typeof window !== 'undefined' && window.speechSynthesis) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ta-IN'; // Tamil (India)
        } else {
            setHasSupport(false);
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []); // Only run once on mount

    // Update event handlers whenever relevant state changes so closures don't go stale
    useEffect(() => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error !== 'no-speech') {
                setError(`Microphone error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            if (isListening) {
                setIsListening(false);
                // Automatically submit when user stops speaking and we have a transcript
                if (transcript.trim().length > 0) {
                    handleAskAstrologer(transcript);
                }
            }
        };
    }, [isListening, transcript, matchData]); // Crucial dependencies

    const toggleListening = () => {
        setError(null);

        if (isListening) {
            playTone(400, 0.2); // Lower tone for stopping
            setTimeout(() => {
                recognitionRef.current?.stop();
                setIsListening(false);
                if (transcript.trim().length > 0) {
                    handleAskAstrologer(transcript);
                }
            }, 100);
        } else {
            // Stop any ongoing speech
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
            setIsSpeaking(false);
            setTranscript('');
            setResponse('');
            setHighlightIndices({ start: 0, end: 0 });
            try {
                playTone(600, 0.15); // High tone for starting
                setTimeout(() => playTone(800, 0.2), 150); // Double chime effect

                setTimeout(() => {
                    recognitionRef.current?.start();
                    setIsListening(true);
                }, 300);
            } catch (err) {
                console.error("Could not start recognition", err);
                setIsListening(false);
            }
        }
    };

    const stopSpeaking = () => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        setIsSpeaking(false);
        setHighlightIndices({ start: 0, end: 0 });
    };

    const handleAskAstrologer = async (questionText) => {
        if (!questionText.trim()) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: questionText,
                    matchData: matchData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            setResponse(data.reply);
            speakResponse(data.reply);
        } catch (err) {
            console.error('Error asking astrologer:', err);
            setError(err.message || 'கணினி ஜோதிடரைத் தொடர்பு கொள்ள முடியவில்லை (Connection Error).');
        } finally {
            setIsProcessing(false);
        }
    };

    const speakResponse = (text) => {
        if (!synthesisRef.current) return;

        // Stop any current speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        let targetVoice = null;
        let voices = synthesisRef.current.getVoices();

        // Very basic heuristic: if text contains Tamil characters, try to use a Tamil voice
        const isTamil = /[\u0B80-\u0BFF]/.test(text);

        if (voices.length > 0) {
            if (isTamil) {
                targetVoice = voices.find(v => v.lang.includes('ta-IN')) || voices.find(v => v.lang.includes('ta'));
            } else {
                targetVoice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en'));
            }
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setHighlightIndices({ start: 0, end: 0 });
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setHighlightIndices({ start: 0, end: 0 });
        };
        utterance.onerror = (e) => {
            console.error('SpeechSynthesis Error:', e);
            setIsSpeaking(false);
            setHighlightIndices({ start: 0, end: 0 });
            setError('குரல் பதிவில் பிழை. (Voice playback error)');
        };
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const start = event.charIndex;
                let end = start + (event.charLength || 0);

                // Fallback if charLength is not natively supported by the browser's TTS engine
                if (!event.charLength || event.charLength === 0) {
                    const nextSpace = text.indexOf(' ', start);
                    end = nextSpace === -1 ? text.length : nextSpace;
                }

                setHighlightIndices({ start, end });

                // Scroll the highlighted word into view smoothly after a tiny delay to ensure React renders the span first
                setTimeout(() => {
                    if (responseScrollRef.current) {
                        const highlightedElement = responseScrollRef.current.querySelector('.highlighted-word');
                        if (highlightedElement) {
                            highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                }, 10);
            }
        };

        // Slow down slightly for clarity
        utterance.rate = 0.95;

        try {
            // Workaround for Chrome bug where speech synthesis gets stuck
            if (synthesisRef.current.paused) {
                synthesisRef.current.resume();
            }
            synthesisRef.current.speak(utterance);

            // Another Chrome workaround: SpeechSynthesis sometimes silently drops utterances 
            // if they are longer than ~15 seconds, so we ensure it's "awake".
            const resumeIfStuck = setInterval(() => {
                if (synthesisRef.current.speaking && !synthesisRef.current.paused) {
                    synthesisRef.current.resume();
                } else if (!synthesisRef.current.speaking && !synthesisRef.current.pending) {
                    clearInterval(resumeIfStuck);
                }
            }, 10000);

        } catch (err) {
            console.error('Speak throw error:', err);
        }
    };

    // Chrome sometimes requires voices to be loaded asynchronously
    useEffect(() => {
        const loadVoices = () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.getVoices();
            }
        };
        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    if (!hasSupport) {
        return (
            <div className="glass-card" style={{ marginTop: '1rem', border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.05)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.9rem', margin: 0 }}>
                    <AlertCircle size={18} />
                    உங்கள் பிரவுசரில் குரல் உதவிக்கு (Voice Assistant) அனுமதி இல்லை. குரோம் (Chrome) பிரவுசரைப் பயன்படுத்தவும்.
                </p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Do not render the widget at all if not authorized
    }

    return (
        <>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {!isExpanded && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: [0, -10, 0]
                            }}
                            transition={{
                                y: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                },
                                scale: { duration: 0.3 },
                                opacity: { duration: 0.3 }
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsExpanded(true)}
                            style={{
                                position: 'fixed',
                                bottom: '6.5rem',
                                right: '1.5rem',
                                zIndex: 999998, // Ensure it's above other page content but below the modal
                                width: '4.5rem',
                                height: '4.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(245, 158, 11, 0.5)',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.5), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 15px rgba(168, 85, 247, 0.4)',
                                pointerEvents: 'auto',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Internal Glow Effect */}
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }}
                            />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Wand2 size={32} />
                                </motion.div>

                                <motion.div
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        color: '#f59e0b'
                                    }}
                                >
                                    <Stars size={14} />
                                </motion.div>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999999,
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
                            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                            boxSizing: 'border-box'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="glass-card"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    maxHeight: '100%',
                                    boxSizing: 'border-box',
                                    border: '1px solid var(--primary)',
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    position: 'relative',
                                    overflowY: 'auto',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(168, 85, 247, 0.3)',
                                    borderRadius: '1.5rem',
                                    pointerEvents: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Header row with title and close button */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                                        <Wand2 size={18} style={{ flexShrink: 0 }} /> ஏஐ ஜோதிடர் (AI Astrologer)
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 1)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsExpanded(false)}
                                        title="Close"
                                        aria-label="Close Voice Assistant"
                                        style={{
                                            width: '36px',
                                            minWidth: '36px',
                                            height: '36px',
                                            padding: 0,
                                            margin: 0,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            lineHeight: 0,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            transition: 'background-color 0.2s, border-color 0.2s',
                                            zIndex: 10
                                        }}
                                    >
                                        <X size={20} strokeWidth={2.5} />
                                    </motion.button>
                                </div>

                                {/* Ambient Background Glow when listening or processing */}
                                <AnimatePresence>
                                    {(isListening || isProcessing || isSpeaking) && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `radial-gradient(circle at center, ${isListening ? 'rgba(239, 68, 68, 0.15)' : isProcessing ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)'} 0%, transparent 70%)`,
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.5 }}>
                                    இந்தப் பொருத்தம் குறித்து உங்களுக்கு ஏதேனும் சந்தேகம் உள்ளதா? மைக்கை அழுத்தித் தமிழில் கேட்கவும்.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                                    {/* Visualizer / Transcript Area */}
                                    <div style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>

                                        {/* Modern Visualizer Animation */}
                                        <AnimatePresence>
                                            {(isListening || isProcessing || isSpeaking) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: '60px' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        marginBottom: '1rem',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {[...Array(10)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{
                                                                height: isProcessing ? ['20%', '80%', '20%'] :
                                                                    isSpeaking ? ['20%', `${Math.random() * 60 + 40}%`, '20%'] :
                                                                        isListening ? ['10%', `${Math.random() * 80 + 20}%`, '10%'] : '10%',
                                                            }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: isProcessing ? 1.5 : isSpeaking ? 0.3 + Math.random() * 0.2 : 0.4 + Math.random() * 0.3,
                                                                delay: i * 0.05,
                                                                ease: "easeInOut"
                                                            }}
                                                            style={{
                                                                width: '8px',
                                                                borderRadius: '4px',
                                                                background: isListening ? '#38bdf8' : isProcessing ? '#c084fc' : '#34d399',
                                                                boxShadow: `0 0 10px ${isListening ? '#38bdf8' : isProcessing ? '#c084fc' : '#34d399'}`
                                                            }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {!transcript && !response && !error && !isListening && !isProcessing && (
                                            <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                "இந்த ஜாதகத்தில் ரஜ்ஜுப் பொருத்தம் எப்படி உள்ளது?"
                                            </span>
                                        )}

                                        {transcript && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: response ? '1rem' : '0', zIndex: 2 }}
                                            >
                                                "{transcript}"
                                            </motion.div>
                                        )}

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                style={{ color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}
                                            >
                                                <AlertCircle size={16} /> {error}
                                            </motion.div>
                                        )}

                                        {isProcessing && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: '0.95rem', zIndex: 2 }}>
                                                <span>ஜோதிடர் ஆராய்கிறார்... (Analyzing)</span>
                                            </div>
                                        )}

                                        {response && !isProcessing && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    color: '#c084fc',
                                                    fontSize: '0.95rem',
                                                    padding: '0.75rem',
                                                    background: 'rgba(168, 85, 247, 0.1)',
                                                    borderRadius: '0.5rem',
                                                    borderLeft: '3px solid #c084fc',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'break-word',
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                <MessageCircle size={20} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                                                <div
                                                    ref={responseScrollRef}
                                                    style={{
                                                        lineHeight: '1.6',
                                                        maxHeight: '180px',
                                                        overflowY: 'auto',
                                                        scrollbarWidth: 'thin',
                                                        scrollbarColor: 'rgba(168, 85, 247, 0.5) transparent',
                                                        flex: 1,
                                                        paddingRight: '0.5rem'
                                                    }}
                                                >
                                                    {isSpeaking && highlightIndices.end > 0 ? (
                                                        <>
                                                            <span>{response.substring(0, highlightIndices.start)}</span>
                                                            <span className="highlighted-word" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fcd34d', borderRadius: '4px', padding: '0 3px', boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }}>
                                                                {response.substring(highlightIndices.start, highlightIndices.end)}
                                                            </span>
                                                            <span>{response.substring(highlightIndices.end)}</span>
                                                        </>
                                                    ) : (
                                                        response
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Controls Area */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={toggleListening}
                                            disabled={isProcessing || isSpeaking}
                                            style={{
                                                width: '4.5rem',
                                                height: '4.5rem',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isListening ? '#0f172a' : 'var(--primary)',
                                                color: isListening ? '#38bdf8' : 'white',
                                                cursor: (isProcessing || isSpeaking) ? 'not-allowed' : 'pointer',
                                                opacity: (isProcessing || isSpeaking) ? 0.5 : 1,
                                                boxShadow: isListening
                                                    ? '0 0 25px rgba(56, 189, 248, 0.5), inset 0 0 15px rgba(56, 189, 248, 0.3)'
                                                    : '0 0 15px rgba(168, 85, 247, 0.4)',
                                                transition: 'all 0.3s ease',
                                                border: isListening ? '2px solid rgba(56, 189, 248, 0.5)' : 'none'
                                            }}
                                        >
                                            {isListening ? <Mic size={32} /> : <Mic size={28} />}
                                        </motion.button>

                                        {isSpeaking && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={stopSpeaking}
                                                style={{
                                                    width: '3rem',
                                                    height: '3rem',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #94a3b8',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    color: '#cbd5e1',
                                                    cursor: 'pointer',
                                                }}
                                                title="Stop speaking"
                                            >
                                                <Square size={18} fill="currentColor" />
                                            </motion.button>
                                        )}
                                    </div>

                                    {isListening && (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '500', letterSpacing: '1px' }}
                                        >
                                            பேசுங்கள்... (Speak now)
                                        </motion.div>
                                    )}

                                    {isSpeaking && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '500' }}
                                        >
                                            <Volume2 size={16} /> ஜோதிடர் கூறுகிறார்...
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default VoiceAssistant;
