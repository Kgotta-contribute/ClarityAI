import React from 'react';
import UploadPanel from '../components/UploadPanel/UploadPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import type { UploadState } from '../types';
import '../components/styles/index.css';

interface TranscriptsPageProps {
  uploadState: UploadState;
  setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
}

const TranscriptsPage: React.FC<TranscriptsPageProps> = ({ uploadState, setUploadState }) => {
  return (
    <div className="transcription-page-container">
      <style>{`
        .transcription-page-container {
          padding: 1.8rem 2.5rem;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: radial-gradient(circle at 80% 20%, #0d122b 0%, #050716 100%);
          overflow-y: auto;
          box-sizing: border-box;
          width: 100%;
          flex: 1;
        }

        .transcription-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0 0.4rem 0;
          position: relative;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .transcription-header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .transcription-logo-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #1e40af 0%, #0f172a 100%);
          border: 1px solid rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(37, 99, 235, 0.5), inset 0 0 12px rgba(59, 130, 246, 0.25);
          color: #38bdf8;
          flex-shrink: 0;
        }

        .transcription-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .transcription-header-title {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .transcription-header-subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        .transcription-hero-illustration {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          user-select: none;
          pointer-events: none;
        }

        .transcription-content-wrapper {
          flex: 1;
          width: 100%;
        }

        /* Light Mode overrides */
        body.LightMode .transcription-page-container {
          color: #1e293b;
          background: radial-gradient(circle at 80% 20%, #f8fafc 0%, #edf2f7 100%);
        }
        body.LightMode .transcription-header-title {
          color: #0f172a;
        }
        body.LightMode .transcription-header-subtitle {
          color: #64748b;
        }

        /* Mobile & Small Screen Responsiveness */
        @media (max-width: 900px) {
          .transcription-page-container {
            padding: 1rem 0.75rem !important;
            gap: 1rem !important;
          }
          .transcription-hero-illustration {
            display: none !important;
          }
          .transcription-header-title {
            font-size: 1.5rem !important;
          }
          .transcription-header-subtitle {
            font-size: 0.85rem !important;
          }
          .transcription-logo-circle {
            width: 42px !important;
            height: 42px !important;
          }
        }
      `}</style>

      {/* Header Banner matching Image 1 */}
      <div className="transcription-header-banner">
        <div className="transcription-header-left">
          <div className="transcription-logo-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <div className="transcription-header-text">
            <h1 className="transcription-header-title">Transcription</h1>
            <p className="transcription-header-subtitle">
              Upload your audio files and let AI do the transcription.
            </p>
          </div>
        </div>

        {/* Futuristic Glowing Microphone & Wave Graphic matching Image 1 */}
        <div className="transcription-hero-illustration">
          <svg width="340" height="95" viewBox="0 0 340 95" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="micBodyGrad" x1="0" y1="0" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="waveLineGrad" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(129, 140, 248, 0.05)" />
                <stop offset="35%" stopColor="rgba(168, 85, 247, 0.5)" />
                <stop offset="70%" stopColor="rgba(192, 132, 252, 0.85)" />
                <stop offset="100%" stopColor="rgba(129, 140, 248, 0.15)" />
              </linearGradient>
              <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing Wave Nodes & Connecting Line */}
            <path
              d="M 10 48 Q 40 18, 70 48 T 130 48 T 180 25 T 230 48 T 275 35 T 315 48 T 335 52"
              stroke="url(#waveLineGrad)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#purpleGlow)"
            />
            <path
              d="M 10 48 Q 40 18, 70 48 T 130 48 T 180 25 T 230 48 T 275 35 T 315 48 T 335 52"
              stroke="rgba(192, 132, 252, 0.9)"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Glowing Nodes on Wave */}
            <circle cx="40" cy="33" r="3" fill="#c084fc" filter="url(#purpleGlow)" />
            <circle cx="100" cy="48" r="3" fill="#a855f7" filter="url(#purpleGlow)" />
            <circle cx="155" cy="36" r="3.5" fill="#c084fc" filter="url(#purpleGlow)" />
            <circle cx="180" cy="25" r="4" fill="#e9d5ff" filter="url(#purpleGlow)" />
            <circle cx="205" cy="36" r="3" fill="#a855f7" filter="url(#purpleGlow)" />
            <circle cx="250" cy="42" r="3" fill="#818cf8" filter="url(#purpleGlow)" />
            <circle cx="295" cy="40" r="3" fill="#c084fc" filter="url(#purpleGlow)" />

            {/* Sparkles / Ambient Stars */}
            <circle cx="95" cy="18" r="1.5" fill="#e9d5ff" opacity="0.8" />
            <circle cx="215" cy="16" r="1.5" fill="#e9d5ff" opacity="0.8" />
            <circle cx="320" cy="22" r="1.5" fill="#c084fc" opacity="0.7" />

            {/* 3D Glowing Microphone Group */}
            <g transform="translate(250, 4)" filter="url(#purpleGlow)">
              {/* Outer U-swivel holder */}
              <path
                d="M 8 36 C 8 54, 42 54, 42 36"
                stroke="#818cf8"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Vertical Stand stem */}
              <line x1="25" y1="49" x2="25" y2="68" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* Circular Weighted Base */}
              <ellipse cx="25" cy="70" rx="14" ry="4" fill="#4f46e5" stroke="#a855f7" strokeWidth="1.8" />
              <ellipse cx="25" cy="68" rx="12" ry="3" fill="#6366f1" />

              {/* Capsule Body */}
              <rect x="14" y="8" width="22" height="36" rx="11" fill="url(#micBodyGrad)" />
              
              {/* Horizontal Capsule Slits / Grille */}
              <rect x="18" y="17" width="14" height="2" rx="1" fill="rgba(255, 255, 255, 0.45)" />
              <rect x="18" y="21" width="14" height="2" rx="1" fill="rgba(255, 255, 255, 0.45)" />
              <rect x="18" y="25" width="14" height="2" rx="1" fill="rgba(255, 255, 255, 0.45)" />
              <rect x="20" y="29" width="10" height="1.8" rx="0.9" fill="rgba(255, 255, 255, 0.35)" />

              {/* Top Highlight on Capsule */}
              <ellipse cx="25" cy="12" rx="6" ry="2" fill="rgba(255, 255, 255, 0.7)" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Upload / Transcription Area */}
      <div className="transcription-content-wrapper">
        <ErrorBoundary>
          <UploadPanel uploadState={uploadState} setUploadState={setUploadState} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TranscriptsPage;