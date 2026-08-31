import React from 'react';

interface ChatBubbleProps {
  time: string;
  name: string;
  role: 'self' | 'default' | 'special';
  children: React.ReactNode;
  onTimeClick?: (e: React.MouseEvent, time: string) => void;
  isActive?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  time,
  name,
  role,
  children,
  onTimeClick,
  isActive = false,
}) => {
  const getBubbleStyle = () => {
    const baseStyle = {
      margin: '0.6rem 0',
      padding: '0.9rem 1.2rem',
      borderRadius: '10px',
      position: 'relative' as const,
      maxWidth: '92%',
      transition: 'all 0.2s ease',
      cursor: onTimeClick ? 'pointer' : 'default',
    };

    switch (role) {
      case 'self':
        return {
          ...baseStyle,
          background: isActive ? '#3182ce' : '#4299e1',
          color: 'white',
          marginLeft: 'auto',
          marginRight: '0',
          boxShadow: isActive ? '0 0 0 2px #90cdf4, 0 4px 12px rgba(66, 153, 225, 0.4)' : 'none',
        };
      case 'special':
        return {
          ...baseStyle,
          background: isActive ? '#6b46c1' : '#805ad5',
          color: 'white',
          marginLeft: 'auto',
          marginRight: '0',
          boxShadow: isActive ? '0 0 0 2px #d6bcfa, 0 4px 12px rgba(128, 90, 213, 0.4)' : 'none',
        };
      default:
        return {
          ...baseStyle,
          background: isActive ? '#1e293b' : 'rgba(30, 41, 59, 0.7)',
          border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f8fafc',
          marginLeft: '0',
          marginRight: 'auto',
          boxShadow: isActive ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 14px rgba(0, 0, 0, 0.3)' : 'none',
        };
    }
  };

  return (
    <div
      style={getBubbleStyle()}
      onClick={(e) => onTimeClick?.(e, time)}
      title="Click to jump and play audio from here"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.45rem',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ fontWeight: 600, color: '#93c5fd', letterSpacing: '0.02em' }}>
          {name}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            padding: '2px 8px',
            borderRadius: '6px',
            color: '#60a5fa',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.35)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.color = '#60a5fa';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTimeClick?.(e, time);
          }}
        >
          <span>▶</span>
          <span>{time}</span>
        </span>
      </div>

      <div style={{ lineHeight: '1.55', fontSize: '0.92rem', color: '#e2e8f0' }}>
        {children}
      </div>
    </div>
  );
};

export default ChatBubble;
