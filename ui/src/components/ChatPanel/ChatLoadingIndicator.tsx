import React, { useState, useEffect } from 'react';

interface ChatLoadingIndicatorProps {
    className?: string;
}

const ChatLoadingIndicator: React.FC<ChatLoadingIndicatorProps> = ({ className = '' }) => {
    const [messageIndex, setMessageIndex] = useState(0);

    const loadingMessages = [
        "Analyzing your query...",
        "Searching through transcripts...",
        "Extracting relevant context...",
        "Synthesizing insights...",
        "Generating response..."
    ];

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2200);

        return () => clearInterval(messageInterval);
    }, [loadingMessages.length]);

    return (
        <div
            className={`chat-loading-indicator ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 20px',
                background: 'rgba(13, 20, 44, 0.85)',
                borderRadius: '14px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                margin: '8px 0 16px 0',
                maxWidth: '540px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 18px rgba(37, 99, 235, 0.2)',
                backdropFilter: 'blur(16px)',
                animation: 'clarityFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            {/* High-Tech Futuristic Robot Avatar */}
            <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                {/* Outer Pulsing Glow Aura */}
                <div style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)',
                    animation: 'claritySpin 3s linear infinite',
                    opacity: 0.85,
                    filter: 'blur(2px)'
                }} />

                {/* Inner Robot Container */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                    border: '1.5px solid rgba(96, 165, 250, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    boxShadow: 'inset 0 0 8px rgba(37, 99, 235, 0.6)'
                }}>
                    {/* Futuristic Robot Vector SVG */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Antenna */}
                        <line x1="12" y1="2" x2="12" y2="5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="2" r="1.5" fill="#38bdf8" />
                        
                        {/* Robot Head Outer */}
                        <rect x="4" y="5" width="16" height="13" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#60a5fa" strokeWidth="1.8" />
                        
                        {/* Robot Visor / Screen */}
                        <rect x="6.5" y="8" width="11" height="6" rx="2" fill="rgba(6, 182, 212, 0.18)" stroke="#22d3ee" strokeWidth="1" />
                        
                        {/* Glowing Cyan Eyes */}
                        <circle cx="9" cy="11" r="1.3" fill="#22d3ee">
                            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="15" cy="11" r="1.3" fill="#22d3ee">
                            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
                        </circle>

                        {/* Ears / Side Nodes */}
                        <rect x="2" y="9.5" width="2" height="4" rx="1" fill="#3b82f6" />
                        <rect x="20" y="9.5" width="2" height="4" rx="1" fill="#3b82f6" />

                        {/* Mouth / Audio Grille */}
                        <line x1="9" y1="15.5" x2="15" y2="15.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Content & Status Messages */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header with Title and Animated Bouncing Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#ffffff',
                        letterSpacing: '0.01em'
                    }}>
                        Clarity AI is thinking
                    </span>

                    {/* Animated Cyan Pulse Dots */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: '#38bdf8',
                                    boxShadow: '0 0 6px rgba(56, 189, 248, 0.8)',
                                    animation: 'clarityDotBounce 1.4s infinite ease-in-out both',
                                    animationDelay: `${i * 0.18}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Subtitle / Dynamic Stage Message */}
                <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#22d3ee',
                        boxShadow: '0 0 6px #22d3ee',
                        flexShrink: 0
                    }} />
                    <span style={{ color: '#cbd5e1' }}>
                        {loadingMessages[messageIndex]}
                    </span>
                </div>
            </div>

            {/* Animated Soundwave Equalizer on Right */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                height: '20px',
                paddingLeft: '8px'
            }}>
                {[0.6, 1.0, 0.4, 0.9, 0.5].map((scale, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: '3px',
                            height: '100%',
                            background: 'linear-gradient(180deg, #38bdf8 0%, #3b82f6 100%)',
                            borderRadius: '3px',
                            animation: `clarityWave 1.1s ease-in-out infinite alternate`,
                            animationDelay: `${idx * 0.15}s`,
                            transformOrigin: 'bottom'
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes clarityFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes claritySpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes clarityDotBounce {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.3;
                    }
                    40% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }

                @keyframes clarityWave {
                    0% { transform: scaleY(0.25); }
                    100% { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
};

export default ChatLoadingIndicator;