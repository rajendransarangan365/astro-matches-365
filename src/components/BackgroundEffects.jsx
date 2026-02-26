import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffects = () => {
    // Generate random stars
    const stars = [...Array(50)].map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
    }));

    // Floating planets/orbs
    const orbs = [
        { size: '300px', color: 'rgba(139, 92, 246, 0.05)', top: '-50px', left: '10%', duration: 25 },
        { size: '400px', color: 'rgba(245, 158, 11, 0.03)', bottom: '10%', right: '5%', duration: 35 },
        { size: '250px', color: 'rgba(99, 102, 241, 0.04)', top: '40%', right: '15%', duration: 30 },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none',
            background: 'var(--bg-dark)'
        }}>
            {/* Dynamic Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '20%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Rotating Zodiac Wheel (Subtle) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    width: '800px',
                    height: '800px',
                    marginLeft: '-400px',
                    opacity: 0.03,
                    border: '1px solid var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{ width: '70%', height: '70%', border: '1px solid var(--primary)', borderRadius: '50%' }} />
                <div style={{ width: '40%', height: '40%', border: '1px solid var(--primary)', borderRadius: '50%' }} />
                {[...Array(12)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        height: '100%',
                        width: '1px',
                        background: 'var(--primary)',
                        transform: `rotate(${i * 30}deg)`
                    }} />
                ))}
            </motion.div>

            {/* Twinkling Stars */}
            {stars.map(star => (
                <motion.div
                    key={star.id}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                    }}
                />
            ))}

            {/* Floating Orbs */}
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: [0, 30, -30, 0],
                        y: [0, -40, 40, 0],
                    }}
                    transition={{
                        duration: orb.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        width: orb.size,
                        height: orb.size,
                        top: orb.top,
                        left: orb.left,
                        bottom: orb.bottom,
                        right: orb.right,
                        borderRadius: '50%',
                        background: orb.color,
                        filter: 'blur(50px)',
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundEffects;
