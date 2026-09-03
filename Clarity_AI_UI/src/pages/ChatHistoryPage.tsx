import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/index.css';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import ErrorBoundary from '../components/ErrorBoundary';

const ChatHistoryPage: React.FC = () => {
  return (
    <div className="chat-transcripts-page-container">
      <style>{`
        .chat-transcripts-page-container {
          padding: 2.5rem;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          height: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          background: radial-gradient(circle at 80% 20%, #0d122b 0%, #050716 100%);
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
          flex: 1;
        }

        .chat-transcripts-header-section {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex-shrink: 0;
        }

        .chat-transcripts-header-icon {
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

        .chat-transcripts-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chat-transcripts-header-text h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .chat-transcripts-header-text p {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        .chat-transcripts-content-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        /* Light Mode overrides */
        body.LightMode .chat-transcripts-page-container {
          color: #1e293b;
          background: radial-gradient(circle at 80% 20%, #f8fafc 0%, #edf2f7 100%);
        }
        body.LightMode .chat-transcripts-header-text h1 {
          color: #0f172a;
        }
        body.LightMode .chat-transcripts-header-text p {
          color: #64748b;
        }

        /* Mobile & Small Screen Responsiveness */
        @media (max-width: 900px) {
          .chat-transcripts-page-container {
            padding: 1rem 0.75rem !important;
            gap: 1rem !important;
            overflow-y: auto !important;
            height: 100% !important;
            -webkit-overflow-scrolling: touch;
          }
          .chat-transcripts-header-section {
            gap: 0.75rem !important;
          }
          .chat-transcripts-header-icon {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
          }
          .chat-transcripts-header-text h1 {
            font-size: 1.25rem !important;
          }
          .chat-transcripts-header-text p {
            font-size: 0.82rem !important;
          }
          .chat-transcripts-content-wrapper {
            flex: 1 !important;
            min-height: 480px !important;
          }
        }
      `}</style>

      {/* Header section matching Image 1 */}
      <div className="chat-transcripts-header-section">
        <div className="chat-transcripts-header-icon">
          <FontAwesomeIcon icon={faComments} />
        </div>
        <div className="chat-transcripts-header-text">
          <h1>Chat with Transcripts</h1>
          <p>Ask anything about your transcripts and get intelligent insights.</p>
        </div>
      </div>

      <div className="chat-transcripts-content-wrapper">
        <ErrorBoundary>
          <ChatPanel />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ChatHistoryPage;