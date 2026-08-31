import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import AudioFilesTable from '../components/AudioFilesTable';
import ErrorBoundary from '../components/ErrorBoundary';
import type { FilterState } from '../types';
import '../components/styles/index.css';

interface AudioFilesPageProps {
  filters?: FilterState;
}

const AudioFilesPage: React.FC<AudioFilesPageProps> = ({ filters }) => {
  return (
    <div className="audio-files-page-container">
      <style>{`
        .audio-files-page-container {
          padding: 2.5rem;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          background: radial-gradient(circle at 80% 20%, #0d122b 0%, #050716 100%);
          overflow-y: auto;
          box-sizing: border-box;
        }

        .audio-files-header-section {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .audio-files-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
          color: #ffffff;
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .audio-files-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .audio-files-header-text h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .audio-files-header-text p {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        /* Light Mode overrides */
        body.LightMode .audio-files-page-container {
          color: #1e293b;
          background: radial-gradient(circle at 80% 20%, #f8fafc 0%, #edf2f7 100%);
        }
        body.LightMode .audio-files-header-text h1 {
          color: #0f172a;
        }
        body.LightMode .audio-files-header-text p {
          color: #64748b;
        }
      `}</style>

      {/* Header section matching user's design */}
      <div className="audio-files-header-section">
        <div className="audio-files-header-icon">
          <FontAwesomeIcon icon={faFolder} />
        </div>
        <div className="audio-files-header-text">
          <h1>Audio Files</h1>
          <p>Manage and view all your files.</p>
        </div>
      </div>

      <ErrorBoundary>
        <AudioFilesTable filters={filters} />
      </ErrorBoundary>
    </div>
  );
};

export default AudioFilesPage;