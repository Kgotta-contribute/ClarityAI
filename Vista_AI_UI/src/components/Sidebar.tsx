import React, { useState, useEffect } from 'react';
import { getAudioFiles } from '../services/apiService';
import { apiConfig } from '../config/api.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFolder, faMicrophone, faComments, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './styles/index.css';

interface SidebarProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab = 'home', 
  onNavigate,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [sparklinePoints, setSparklinePoints] = useState<{x: number, y: number}[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTotalFiles = async () => {
      try {
        const response = await getAudioFiles(1, 100); // Fetch last 100 files
        const total = response.pagination.total;
        setTotalFiles(total);

        // Group files by day for the last 10 days
        const counts = Array(10).fill(0);
        const today = new Date();
        
        // Helper to extract date string in YYYY-MM-DD from response receivedAt date
        const parseDateOnly = (dateStr: string): string => {
          if (!dateStr) return '';
          // Handle DD/MM/YYYY
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2];
              return `${y}-${m}-${d}`;
            }
          }
          // Handle ISO or YYYY-MM-DD
          return dateStr.substring(0, 10);
        };

        const dayKeys = Array(10).fill('').map((_, idx) => {
          const d = new Date();
          d.setDate(today.getDate() - (9 - idx)); // 9 days ago to today
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        });

        if (response.records && response.records.length > 0) {
          response.records.forEach((file) => {
            const fileDate = parseDateOnly(file.receivedAt);
            const dayIdx = dayKeys.indexOf(fileDate);
            if (dayIdx !== -1) {
              counts[dayIdx] += 1;
            }
          });
        }

        // Map counts to points
        const maxVal = Math.max(...counts);
        const newPoints = counts.map((count, idx) => {
          const x = 10 + idx * 20; // 10, 30, 50, ..., 190
          // SVG height is 30. Bottom is 25, top is 5
          let y = 25; 
          if (maxVal > 0) {
            y = 25 - (count / maxVal) * 20; // scale between 5 and 25
          }
          return { x, y };
        });

        setSparklinePoints(newPoints);

      } catch (error) {
        console.error('Error fetching total files count:', error);
        setTotalFiles(0);
        // Default flat line at 25px (0 interactions)
        setSparklinePoints(Array(10).fill(0).map((_, idx) => ({ x: 10 + idx * 20, y: 25 })));
      } finally {
        setLoading(false);
      }
    };

    fetchTotalFiles();
  }, []);

  const handleMenuClick = (tabKey: string) => {
    if (onNavigate) {
      onNavigate(tabKey);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const menuItems = [
    { label: 'Home', key: 'home', icon: faHome },
    { label: 'Audio Files', key: 'audiofiles', icon: faFolder },
    { label: 'Transcription', key: 'transcription', icon: faMicrophone },
    { label: 'Chat', key: 'chathistory', icon: faComments }
  ];

  return (
    <>
      {/* Semi-transparent Backdrop for Mobile Drawer */}
      {isMobileOpen && (
        <div 
          className="sidebar-mobile-backdrop" 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            cursor: 'pointer'
          }}
        />
      )}

      <div className={`sidebar-vertical-pane ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Encapsulated styling for left vertical panel */}
        <style>{`
          .sidebar-vertical-pane {
            width: 260px;
            min-width: 260px;
            height: 100vh;
            background-color: #070919;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            padding: 2rem 1.25rem 1.5rem 1.25rem;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 10;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            -webkit-overflow-scrolling: touch;
          }

          .sidebar-vertical-pane::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-vertical-pane::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-vertical-pane::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 4px;
          }

          @media (max-width: 900px) {
            .sidebar-vertical-pane {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              height: 100vh !important;
              width: 280px !important;
              min-width: 280px !important;
              z-index: 9999 !important;
              transform: translateX(-100%);
              box-shadow: 0 0 40px rgba(0, 0, 0, 0.85);
              overflow-y: auto !important;
              overflow-x: hidden !important;
              padding-bottom: 3rem !important;
            }
            .sidebar-vertical-pane.mobile-open {
              transform: translateX(0) !important;
            }
            .sidebar-mobile-close-btn {
              display: flex !important;
            }
          }

          @media (min-width: 901px) {
            .sidebar-mobile-close-btn {
              display: none !important;
            }
          }

          /* Logo Header */
          .sidebar-logo-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2.5rem;
            padding-left: 0.5rem;
          }
          .sidebar-logo-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
          }
          .sidebar-logo-ai {
            color: #3b82f6;
          }
          .sidebar-logo-dot {
            color: #60a5fa;
          }

          .sidebar-mobile-close-btn {
            display: none;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #94a3b8;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .sidebar-mobile-close-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.15);
          }
        
        /* Navigation Menu */
        .sidebar-nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .sidebar-nav-item:hover {
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.02);
        }
        
        /* Active menu styling */
        .sidebar-nav-item.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
          font-weight: 600;
        }
        .sidebar-nav-item.active .nav-icon {
          color: #3b82f6;
          filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
        }
        .nav-icon {
          font-size: 1.05rem;
          color: #64748b;
          width: 20px;
          text-align: center;
          transition: color 0.2s;
        }
        .sidebar-nav-item:hover .nav-icon {
          color: #cbd5e1;
        }

        /* Divider line */
        .sidebar-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin-bottom: 2rem;
          width: 100%;
        }

        /* Interactions Box */
        .interactions-metric-box {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.25rem;
          box-sizing: border-box;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.01);
        }
        .metric-title {
          font-size: 0.85rem;
          color: #475569;
          font-weight: 500;
          line-height: 1.2;
        }
        .metric-subtitle {
          font-size: 0.75rem;
          color: #334155;
          margin-bottom: 2px;
        }
        .metric-value {
          font-size: 2.25rem;
          font-weight: 700;
          color: #38bdf8;
          background: linear-gradient(to right, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }
        .metric-sparkline {
          width: 100%;
          height: 30px;
          margin-top: 4px;
        }

        /* GitHub Box Link */
        .sidebar-github-box {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          margin-top: auto;
          margin-bottom: 3.5rem;
          z-index: 12;
        }
        .sidebar-github-box:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .github-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Download Test Files Card */
        .sidebar-download-card {
          background: rgba(56, 189, 248, 0.03);
          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          margin: 0 0 0.5rem 0;
          z-index: 12;
        }
        .download-card-header {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 0.6rem;
        }
        .download-card-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: #38bdf8;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .download-card-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .download-file-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 0.45rem 0.65rem;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .download-file-btn:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.25);
          color: #e2e8f0;
        }
        .download-file-btn span {
          flex: 1;
        }
        .file-badge {
          font-size: 0.68rem;
          color: #64748b;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          padding: 1px 5px;
          flex: none !important;
        }

        /* Background Audio Wave Graphic at the very bottom */
        .sidebar-bottom-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 90px;
          pointer-events: none;
          opacity: 0.75;
          z-index: 1;
        }

        /* Light Mode overrides */
        body.LightMode .sidebar-vertical-pane {
          background-color: #f8fafc;
          border-right: 1px solid #e2e8f0;
        }
        body.LightMode .sidebar-divider {
          background: #e2e8f0;
        }
        body.LightMode .sidebar-nav-item {
          color: #475569;
        }
        body.LightMode .sidebar-nav-item:hover {
          color: #0f172a;
          background: rgba(0, 0, 0, 0.02);
        }
        body.LightMode .sidebar-nav-item.active {
          color: #1e3a8a;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%);
          border: 1px solid rgba(59, 130, 246, 0.15);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.05);
        }
        body.LightMode .sidebar-nav-item.active .nav-icon {
          color: #3b82f6;
        }
        body.LightMode .nav-icon {
          color: #64748b;
        }
        body.LightMode .interactions-metric-box {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.01);
        }
        body.LightMode .metric-title {
          color: #475569;
        }
        body.LightMode .metric-subtitle {
          color: #64748b;
        }
        body.LightMode .sidebar-github-box {
          background: #ffffff;
          border-color: #e2e8f0;
          color: #475569;
        }
        body.LightMode .sidebar-github-box:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        body.LightMode .sidebar-github-box svg {
          fill: #475569;
        }
        body.LightMode .sidebar-github-box:hover svg {
          fill: #0f172a;
        }
        body.LightMode .sidebar-bottom-wave {
          opacity: 0.15;
        }
        body.LightMode .sidebar-download-card {
          background: rgba(14, 165, 233, 0.04);
          border-color: rgba(14, 165, 233, 0.2);
        }
        body.LightMode .download-card-title {
          color: #0ea5e9;
        }
        body.LightMode .download-file-btn {
          background: #ffffff;
          border-color: #e2e8f0;
          color: #475569;
        }
        body.LightMode .download-file-btn:hover {
          background: rgba(14, 165, 233, 0.06);
          border-color: rgba(14, 165, 233, 0.3);
          color: #0f172a;
        }
        body.LightMode .file-badge {
          background: #f1f5f9;
          color: #94a3b8;
        }
      `}</style>

      {/* Mobile Drawer Header with Close Button */}
      <div className="sidebar-logo-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sidebar-logo-text">Clarity<span className="sidebar-logo-dot">.</span><span className="sidebar-logo-ai">AI</span></span>
        </div>
        <button 
          className="sidebar-mobile-close-btn" 
          onClick={onCloseMobile}
          title="Close Navigation"
        >
          ✕
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.key)}
          >
            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Interactions Metrics Card */}
      <div className="interactions-metric-box">
        <span className="metric-title">Interactions</span>
        <span className="metric-subtitle">Last 30 Days</span>
        <span className="metric-value">
          {loading ? '0' : totalFiles.toLocaleString()}
        </span>
        {/* Purple neon sparkline SVG */}
        <div className="metric-sparkline">
          <svg width="100%" height="100%" viewBox="0 0 200 30" fill="none">
            {sparklinePoints.length > 0 ? (
              <>
                <path
                  d={`M ${sparklinePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(129, 140, 248, 0.6))' }}
                />
                {/* Sparkline vertices dots */}
                {sparklinePoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="2.5" fill="#818cf8" />
                ))}
              </>
            ) : (
              // Flat line fallback (0 uploads)
              <path
                d="M 10 25 L 190 25"
                stroke="#818cf8"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ opacity: 0.3 }}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Download Test Files Card */}
      <div className="sidebar-download-card">
        <div className="download-card-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="#38bdf8"/>
            <path d="M20 18H4V20H20V18Z" fill="#38bdf8"/>
          </svg>
          <span className="download-card-title">Download to Test</span>
        </div>
        <div className="download-card-links">
          <a
            className="download-file-btn"
            href={apiConfig.endpoints.sampleDownload('2peopleDiscussionMP3.mp3')}
            download="2peopleDiscussionMP3.mp3"
            title="2-person discussion audio file (~8.4 MB)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>Sample MP3</span>
            <span className="file-badge">8.4 MB</span>
          </a>
          <a
            className="download-file-btn"
            href={apiConfig.endpoints.sampleDownload('dune3.mp4')}
            download="dune3.mp4"
            title="Dune video clip (~7.1 MB)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            <span>Sample MP4</span>
            <span className="file-badge">7.1 MB</span>
          </a>
        </div>
      </div>

      {/* GitHub Link box */}
      <a 
        className="sidebar-github-box" 
        href="https://www.github.com/Kgotta-Contribute/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <div className="github-left">
          <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </div>
        <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '0.8rem', opacity: 0.6 }} />
      </a>

      {/* Decorative Bottom Wave */}
      <svg className="sidebar-bottom-wave" viewBox="0 0 260 90" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveBottomGrad" x1="0" y1="90" x2="260" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#312e81" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#070919" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 90 L 0 70 C 40 50, 80 80, 120 65 C 160 50, 200 75, 260 55 L 260 90 Z"
          fill="url(#waveBottomGrad)"
        />
        <path
          d="M 0 75 C 50 55, 90 85, 130 68 C 170 51, 210 77, 260 58"
          stroke="#818cf8"
          strokeWidth="1"
          strokeOpacity="0.25"
        />
        <path
          d="M 0 80 C 40 65, 80 90, 120 72 C 160 54, 200 80, 260 62"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeOpacity="0.15"
        />
      </svg>
    </div>
    </>
  );
};

export default Sidebar;