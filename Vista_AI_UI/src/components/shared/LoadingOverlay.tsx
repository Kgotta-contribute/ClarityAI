
import React from 'react';

 

interface LoadingOverlayProps {

  title: string;

  message: string;

  absolute?: boolean;

}

 

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ title, message, absolute = false }) => {

  return (

    <div style={{

      position: absolute ? 'absolute' : 'fixed',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      backgroundColor: 'rgba(0, 0, 0, 0.6)',

      backdropFilter: 'blur(10px)',

      WebkitBackdropFilter: 'blur(10px)',

      zIndex: 1001,

      display: 'flex',

      justifyContent: 'center',

      alignItems: 'center',

      borderRadius: absolute ? '12px' : '0'

    }}>

      <div style={{

        background: '#2d3748',

        padding: '2rem 3rem',

        borderRadius: '12px',

        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',

        display: 'flex',

        flexDirection: 'column',

        alignItems: 'center',

        gap: '1rem'

      }}>

        <div style={{

          width: '50px',

          height: '50px',

          border: '4px solid #4a5568',

          borderTop: '4px solid #4299e1',

          borderRadius: '50%',

          animation: 'spin 1s linear infinite'

        }} />

        <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>

          {title}

        </div>

        <div style={{ color: '#a0aec0', fontSize: '0.9rem', textAlign: 'center' }}>

          {message}

        </div>

        <style>{`

          @keyframes spin {

            0% { transform: rotate(0deg); }

            100% { transform: rotate(360deg); }

          }

        `}</style>

      </div>

    </div>

  );

};

 

export default LoadingOverlay;

 

 