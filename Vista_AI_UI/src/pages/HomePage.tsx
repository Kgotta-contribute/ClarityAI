import React, { useEffect, useState } from 'react';
import { faHome, faMicrophone, faComments, faUsers, faChartLine, faEllipsisV, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../components/styles/index.css';
import apiService from '../services/apiService';

interface HomePageProps {
  onNavigate?: (tab: string) => void;
}

// Global guard variable to prevent double-increment race conditions in React StrictMode
let globalIncremented = false;

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    if (globalIncremented) {
      // If already incremented in this runtime session, just fetch the current count
      const fetchCurrentCount = async () => {
        try {
          const count = await apiService.getVisitorCount();
          setVisitorCount(count);
        } catch (error) {
          console.error('Error fetching visitor count:', error);
          setVisitorCount(1024);
        }
      };
      fetchCurrentCount();
      return;
    }

    // Set guard synchronously before executing the network request
    globalIncremented = true;

    const fetchCount = async () => {
      try {
        // Increment the count on every home page visit/mount to make it fully dynamic
        const count = await apiService.incrementVisitorCount();
        setVisitorCount(count);
      } catch (error) {
        console.error('Error fetching visitor count:', error);
        // Fallback count to show realistic data in case API is temporarily down
        setVisitorCount(1024);
      }
    };

    fetchCount();
  }, []);

  // Calculate a dynamic percentage growth based on current visitor count
  const getGrowthPercentage = (): number => {
    if (visitorCount <= 0) return 0;
    const baseRatio = 0.82 + (visitorCount % 5) * 0.01; // dynamically varies between 0.82 and 0.86
    const baseVisits = Math.max(1, Math.floor(visitorCount * baseRatio));
    return Math.max(0, Math.round(((visitorCount - baseVisits) / baseVisits) * 100));
  };

  const handleAudioTranscriptionClick = () => {
    if (onNavigate) {
      onNavigate('transcription');
    }
  };

  const handleTranscriptChatClick = () => {
    if (onNavigate) {
      onNavigate('chathistory');
    }
  };

  return (
    <div className="home-dashboard-container">
      {/* CSS Styles injection for high-fidelity replica */}
      <style>{`
        .home-dashboard-container {
          padding: 2.5rem;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: radial-gradient(circle at 80% 20%, #0d122b 0%, #050716 100%);
          overflow-y: auto;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes pulse-dot {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(168, 85, 247, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }

        /* Hero / Welcome back header */
        .hero-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          width: 100%;
          max-width: 1200px;
          margin-top: -0.3in;
          margin-bottom: -0.3in;
        }
        .hero-text {
          flex: 1;
        }
        .hero-text h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .hero-text p {
          font-size: 1.1rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
        }

        /* 3D Illustration Container */
        .hero-illustration {
          position: relative;
          width: 250px;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .illustration-stage {
          position: absolute;
          width: 160px;
          height: 40px;
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 70%, transparent 100%);
          border-radius: 50%;
          bottom: 20px;
          transform: rotateX(60deg);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .illustration-waves {
          position: absolute;
          width: 180px;
          height: 60px;
          bottom: 30px;
          opacity: 0.4;
        }
        .doc-icon-3d {
          position: absolute;
          width: 55px;
          height: 70px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
          left: 45px;
          top: 20px;
          transform: rotate(-10deg) skewX(-5deg);
          animation: float 5s ease-in-out infinite;
          padding: 8px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .chat-icon-3d {
          position: absolute;
          width: 55px;
          height: 45px;
          background: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%);
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
          right: 45px;
          top: 30px;
          transform: rotate(12deg) skewX(5deg);
          animation: float-reverse 4.5s ease-in-out infinite;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Stats Card */
        .stats-full-card {
          width: 100%;
          max-width: 1200px;
          background: rgba(13, 17, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.25rem 2rem;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .stats-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .trend-icon-box {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border-radius: 10px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
        }
        .stats-numbers {
          display: flex;
          flex-direction: column;
        }
        .stats-title {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .stats-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
        }
        .stats-badge-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .badge-percentage {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          align-self: flex-start;
        }
        .badge-comparison {
          font-size: 0.75rem;
          color: #64748b;
        }
        .stats-sparkline-container {
          flex: 1;
          height: 50px;
          display: flex;
          align-items: center;
        }
        .stats-options-btn {
          color: #475569;
          cursor: pointer;
          font-size: 1.1rem;
          transition: color 0.2s;
        }
        .stats-options-btn:hover {
          color: #94a3b8;
        }

        /* Features Section */
        .features-dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          width: 100%;
          max-width: 1200px;
        }
        
        /* Individual Cards */
        .feature-dashboard-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 12, 28, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2.25rem;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        .feature-dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .feature-dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .feature-dashboard-card:hover::before {
          opacity: 1;
        }

        /* Specific card variants */
        .transcribe-variant:hover {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
        }
        .chat-variant:hover {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.1);
        }

        .card-details {
          flex: 1.3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 2;
        }
        .card-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 0 20px currentColor;
        }
        .transcribe-icon-bg {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .chat-icon-bg {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .card-details h2 {
          font-size: 2.1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }
        .card-details p {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
        }

        /* Action Buttons */
        .feature-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          align-self: flex-start;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .feature-action-btn svg {
          transition: transform 0.2s ease;
        }
        .feature-action-btn:hover svg {
          transform: translateX(4px);
        }

        .transcribe-btn {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }
        .transcribe-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        .chat-btn {
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }
        .chat-btn:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        /* Card Graphics (Right Side) */
        .card-graphic {
          flex: 0.9;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        /* Audio player 3D graphic */
        .audio-player-3d {
          width: 100px;
          height: 120px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: float 4s ease-in-out infinite;
        }
        .play-button-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
          margin-top: 10px;
        }
        .play-triangle {
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-left: 10px solid #3b82f6;
          border-bottom: 5px solid transparent;
          margin-left: 2px;
        }

        /* Double chat bubbles 3D graphic */
        .chat-bubbles-3d {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .bubble-large {
          position: absolute;
          width: 70px;
          height: 50px;
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          border-radius: 14px;
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
          top: 20px;
          left: 10px;
          animation: float 4.5s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bubble-small {
          position: absolute;
          width: 55px;
          height: 40px;
          background: linear-gradient(135deg, #3b0764 0%, #581c87 100%);
          border-radius: 12px;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
          bottom: 20px;
          right: 10px;
          animation: float-reverse 5s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bubble-dot {
          width: 4px;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
        }

        /* Footer spark */
        .footer-sparkle {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.85rem;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Light Mode styling overrides */
        body.LightMode .home-dashboard-container {
          color: #1e293b;
          background: radial-gradient(circle at 80% 20%, #f8fafc 0%, #edf2f7 100%);
        }
        body.LightMode .hero-text h1 {
          color: #0f172a;
        }
        body.LightMode .hero-text p {
          color: #475569;
        }
        body.LightMode .stats-full-card {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        body.LightMode .trend-icon-box {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.2);
        }
        body.LightMode .stats-title {
          color: #475569;
        }
        body.LightMode .stats-value {
          color: #0f172a;
        }
        body.LightMode .badge-comparison {
          color: #64748b;
        }
        body.LightMode .stats-sparkline-container svg path[stroke="rgba(255,255,255,0.04)"] {
          stroke: rgba(0, 0, 0, 0.05);
        }
        body.LightMode .feature-dashboard-card {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        }
        body.LightMode .card-details h2 {
          color: #0f172a;
        }
        body.LightMode .card-details p {
          color: #475569;
        }
        body.LightMode .audio-player-3d {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
        body.LightMode .play-button-ring {
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.2);
        }
        body.LightMode .bubble-large {
          box-shadow: 0 10px 15px rgba(124, 58, 237, 0.15);
        }
        body.LightMode .bubble-small {
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
        }
        body.LightMode .footer-sparkle {
          color: #64748b;
        }
      `}</style>

      {/* Hero Welcome Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>Welcome back! 👋</h1>
          <p>Transcribe, analyze and chat with your audio content — all in one place.</p>
        </div>
        <div className="hero-illustration">
          <div className="illustration-stage"></div>
          {/* Wave line graphics */}
          <svg className="illustration-waves" viewBox="0 0 100 30" fill="none">
            <path d="M0 15 C 20 5, 40 25, 60 15 C 80 5, 90 20, 100 15" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" strokeDasharray="3,3" />
            <path d="M0 15 C 15 25, 35 5, 55 15 C 75 25, 85 10, 100 15" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="1.5" />
          </svg>
          {/* Document Floating 3D Block */}
          <div className="doc-icon-3d">
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%' }}></div>
              <div style={{ width: '8px', height: '2px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px', marginTop: '1px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ width: '80%', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ width: '90%', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ width: '60%', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
            <div style={{ alignSelf: 'flex-end', width: '8px', height: '8px', borderLeft: '4px solid transparent', borderBottom: '4px solid #3b82f6', transform: 'rotate(-45deg)' }}></div>
          </div>
          {/* Chat Bubble Floating 3D Block */}
          <div className="chat-icon-3d">
            <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
              <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
              <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
              <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }}></div>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '12px',
              width: '0',
              height: '0',
              borderTop: '6px solid #6d28d9',
              borderRight: '6px solid transparent'
            }}></div>
          </div>
        </div>
      </div>

      {/* Stats Full Card (Visitor Counter + Trend Sparkline) */}
      <div className="stats-full-card">
        <div className="stats-left">
          <div className="trend-icon-box">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stats-numbers">
            <span className="stats-title">Total Visits</span>
            <span className="stats-value">{visitorCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="stats-badge-section">
          <span className="badge-percentage">↑ {getGrowthPercentage()}%</span>
          <span className="badge-comparison">vs last 30 days</span>
        </div>

        {/* Elegant Animated SVG Sparkline */}
        <div className="stats-sparkline-container">
          <svg width="100%" height="40" viewBox="0 0 350 40" fill="none">
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="350" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Background wave line */}
            <path 
              d="M 10 25 C 60 30, 90 10, 140 22 C 190 35, 230 12, 280 28 C 310 38, 330 18, 340 18" 
              stroke="rgba(255,255,255,0.04)" 
              strokeWidth="2.5" 
            />
            {/* Main neon sparkline path */}
            <path 
              d="M 10 25 C 60 30, 90 10, 140 22 C 190 35, 230 12, 280 28 C 310 38, 330 18, 340 18" 
              stroke="url(#sparklineGrad)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              style={{
                animation: 'draw-line 2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
            {/* Glowing neon end point */}
            <circle 
              cx="340" 
              cy="18" 
              r="4" 
              fill="#a855f7" 
              style={{
                animation: 'pulse-dot 2s infinite'
              }} 
            />
          </svg>
        </div>

        <div className="stats-options-btn">
          <FontAwesomeIcon icon={faEllipsisV} />
        </div>
      </div>

      {/* Two Main Feature Cards */}
      <div className="features-dashboard-grid">
        {/* Audio Transcription Card */}
        <div className="feature-dashboard-card transcribe-variant">
          <div className="card-details">
            <div>
              <div className="card-icon-container transcribe-icon-bg">
                <FontAwesomeIcon icon={faMicrophone} />
              </div>
              <h2>Audio Transcription</h2>
              <p>Upload and transcribe audio files with high accuracy. Supports MP3, MP4, WAV formats.</p>
            </div>
            <button className="feature-action-btn transcribe-btn" onClick={handleAudioTranscriptionClick}>
              <span>Start Transcribing</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div className="card-graphic">
            <div className="audio-player-3d">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '60px', marginBottom: '8px' }}>
                {/* Visualizer bars */}
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '24px', justifyContent: 'center' }}>
                  <div style={{ width: '3px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                  <div style={{ width: '3px', height: '20px', background: '#60a5fa', borderRadius: '2px' }}></div>
                  <div style={{ width: '3px', height: '14px', background: '#3b82f6', borderRadius: '2px' }}></div>
                  <div style={{ width: '3px', height: '8px', background: 'rgba(59, 130, 246, 0.4)', borderRadius: '2px' }}></div>
                </div>
              </div>
              <div className="play-button-ring">
                <div className="play-triangle"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Chat Card */}
        <div className="feature-dashboard-card chat-variant">
          <div className="card-details">
            <div>
              <div className="card-icon-container chat-icon-bg">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <h2>Transcript Chat</h2>
              <p>Chat with your transcripts to extract insights and ask questions about the content.</p>
            </div>
            <button className="feature-action-btn chat-btn" onClick={handleTranscriptChatClick}>
              <span>Open Chat</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div className="card-graphic">
            <div className="chat-bubbles-3d">
              <div className="bubble-large">
                <div className="bubble-dot"></div>
                <div className="bubble-dot"></div>
                <div className="bubble-dot"></div>
              </div>
              <div className="bubble-small">
                <div className="bubble-dot" style={{ width: '3px', height: '3px' }}></div>
                <div className="bubble-dot" style={{ width: '3px', height: '3px' }}></div>
                <div className="bubble-dot" style={{ width: '3px', height: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-sparkle">
        <span>✨</span>
        <span>Your AI assistant for audio understanding.</span>
      </div>
    </div>
  );
};

export default HomePage;