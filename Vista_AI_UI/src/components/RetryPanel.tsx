
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {

  faHourglass,

  faCheckCircle,

  faArrowUp,

  faMicrophone,

  faGear,

  faRotateRight,

  faCircleXmark,

  faFileAudio

} from '@fortawesome/free-solid-svg-icons';

import { useTheme } from '../hooks/useTheme';

import { useFileStatusMonitor } from '../hooks/useFileStatusMonitor';

 

interface RetryPanelProps {

  jobId: string;

  fileId: string;

  fileName: string;

  onClose: () => void;

}

 

const RetryPanel: React.FC<RetryPanelProps> = ({

  jobId,

  fileId,

  fileName,

  onClose

}) => {

  const { theme } = useTheme();

  const { fileStatus, loading, error, startMonitoring, reset } = useFileStatusMonitor(jobId, fileId);

 

  const getStatusIcon = () => {

    if (!fileStatus) return <FontAwesomeIcon icon={faHourglass} />;

   

    switch (fileStatus.status) {

      case 'completed':

        return <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />;

      case 'processing':

        if (fileStatus.progress?.stage === 'uploading') return <FontAwesomeIcon icon={faArrowUp} style={{ color: '#4a90d9' }} />;

        if (fileStatus.progress?.stage === 'transcribing') return <FontAwesomeIcon icon={faMicrophone} style={{ color: '#4a90d9' }} />;

        if (fileStatus.progress?.stage === 'processing') return <FontAwesomeIcon icon={faGear} style={{ color: '#4a90d9' }} spin />;

        return <FontAwesomeIcon icon={faRotateRight} style={{ color: '#4a90d9' }} spin />;

      case 'error':

      case 'Failed':

        return <FontAwesomeIcon icon={faCircleXmark} style={{ color: '#f44336' }} />;

      case 'pending':

        return <FontAwesomeIcon icon={faHourglass} style={{ color: '#cdcdcd' }} />;

      default:

        return <FontAwesomeIcon icon={faHourglass} />;

    }

  };

 

  const getStatusText = () => {

    if (error) return `Error: ${error}`;

    if (!fileStatus) return 'Initializing retry...';

 

    if (fileStatus.status === 'completed') {

      return `${fileStatus.progress?.stage || 'Completed'}`;

    } else if (fileStatus.status === 'error' || fileStatus.status === 'Failed') {

      return `Error: ${fileStatus.errorDetails || 'Processing failed'}`;

    } else if (fileStatus.status === 'processing') {

      return `${fileStatus.progress?.stage || 'Processing'}`;

    } else if (fileStatus.status === 'pending') {

      return 'Pending...';

    }

 

    return 'Processing...';

  };

 

  const getStatusColor = () => {

    if (error) return '#f44336';

    if (!fileStatus) return '#4a90d9';

 

    switch (fileStatus.status) {

      case 'completed':

        return '#4caf50';

      case 'processing':

        return '#4a90d9';

      case 'error':

      case 'Failed':

        return '#f44336';

      case 'pending':

        return '#cdcdcd';

      default:

        return '#cdcdcd';

    }

  };

 

  const getCurrentProgress = () => {

    if (!fileStatus?.progress?.percentage) return 0;

    return Math.round(fileStatus.progress.percentage);

  };

 

  return (

    <>

      {/* Backdrop with blur */}

      <div

        style={{

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          backgroundColor: 'rgba(0, 0, 0, 0.7)',

          backdropFilter: 'blur(8px)',

          zIndex: 9998,

        }}

        onClick={onClose}

      />

 

      {/* Retry Panel Popover */}

      <div

        style={{

          position: 'fixed',

          top: '50%',

          left: '50%',

          transform: 'translate(-50%, -50%)',

          width: '90%',

          maxWidth: '600px',

          maxHeight: '80vh',

          backgroundColor: theme.colors.background,

          border: `2px solid ${theme.colors.border}`,

          borderRadius: '12px',

          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',

          zIndex: 9999,

          display: 'flex',

          flexDirection: 'column',

          overflow: 'hidden',

        }}

        onClick={(e) => e.stopPropagation()}

      >

        {/* Header */}

        <div

          style={{

            padding: '20px',

            background: theme.colors.secondary,

            color: theme.colors.text,

            borderBottom: `1px solid ${theme.colors.border}`,

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

          }}

        >

          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>

            <FontAwesomeIcon icon={faRotateRight} />

            Retry Transcription

          </h2>

          <button

            onClick={onClose}

            style={{

              background: 'transparent',

              border: 'none',

              color: theme.colors.text,

              fontSize: '24px',

              cursor: 'pointer',

              padding: '0 8px',

              lineHeight: '1',

            }}

          >

            ×

          </button>

        </div>

 

        {/* Body */}

        <div

          style={{

            padding: '24px',

            overflowY: 'auto',

            flex: 1,

          }}

        >

          {/* File Info */}

          <div

            style={{

              padding: '16px',

              backgroundColor: theme.colors.surface,

              borderRadius: '8px',

              border: `1px solid ${theme.colors.border}`,

              marginBottom: '20px',

            }}

          >

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>

              <span style={{ fontSize: '24px', marginRight: '12px' }}>

                <FontAwesomeIcon icon={faFileAudio} style={{ color: theme.colors.text }} />

              </span>

              <div style={{ flex: 1 }}>

                <div style={{ color: theme.colors.text, fontWeight: 'bold', marginBottom: '4px' }}>

                  {fileName}

                </div>

                <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>

                  Job ID: {jobId}

                </div>

                <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>

                  File ID: {fileId}

                </div>

              </div>

            </div>

          </div>

 

          {/* Loading State */}

          {loading && (

            <div

              style={{

                padding: '24px',

                textAlign: 'center',

                color: theme.colors.textSecondary,

              }}

            >

              <FontAwesomeIcon icon={faRotateRight} spin size="2x" style={{ marginBottom: '12px' }} />

              <div>Checking file status...</div>

            </div>

          )}

 

          {/* Status Section */}

          {!loading && (

            <div

              style={{

                padding: '16px',

                backgroundColor: theme.colors.surface,

                borderRadius: '8px',

                border: `2px solid ${getStatusColor()}`,

                marginBottom: '20px',

              }}

            >

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>

                <span style={{ fontSize: '32px', marginRight: '12px' }}>{getStatusIcon()}</span>

                <div style={{ flex: 1 }}>

                  <div style={{ color: theme.colors.text, fontWeight: 'bold', marginBottom: '4px' }}>

                    Status

                  </div>

                  <div style={{ color: getStatusColor(), fontSize: '14px' }}>

                    {getStatusText()}

                  </div>

                </div>

              </div>

 

              {/* Progress Bar */}

              {fileStatus && fileStatus.status === 'processing' && (

                <div style={{ marginTop: '16px' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>

                    <span style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>

                      Progress

                    </span>

                    <span style={{ color: theme.colors.text, fontSize: '12px', fontWeight: 'bold' }}>

                      {getCurrentProgress()}%

                    </span>

                  </div>

                  <div

                    style={{

                      width: '100%',

                      height: '24px',

                      backgroundColor: theme.colors.background,

                      border: `2px solid ${theme.colors.border}`,

                      borderRadius: '12px',

                      overflow: 'hidden',

                      position: 'relative',

                    }}

                  >

                    <div

                      style={{

                        width: `${getCurrentProgress()}%`,

                        height: '100%',

                        backgroundColor: '#4a90d9',

                        transition: 'width 0.3s ease',

                        display: 'flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                      }}

                    >

                      {getCurrentProgress() > 10 && (

                        <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>

                          {getCurrentProgress()}%

                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          )}

 

          {/* Additional Info */}

          {fileStatus?.progress?.stage && (

            <div

              style={{

                padding: '12px',

                backgroundColor: theme.colors.surfaceHover,

                borderRadius: '6px',

                border: `1px solid ${theme.colors.border}`,

              }}

            >

              <div style={{ color: theme.colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>

                Current Stage

              </div>

              <div style={{ color: theme.colors.text, fontSize: '14px', fontWeight: 'bold' }}>

                {fileStatus.progress.stage}

              </div>

            </div>

          )}

 

          {/* Error Details */}

          {fileStatus?.errorDetails && (

            <div

              style={{

                marginTop: '16px',

                padding: '12px',

                backgroundColor: '#f443361a',

                borderRadius: '6px',

                border: '1px solid #f44336',

              }}

            >

              <div style={{ color: '#f44336', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>

                Error Details

              </div>

              <div style={{ color: '#f44336', fontSize: '12px' }}>

                {fileStatus.errorDetails}

              </div>

            </div>

          )}

 

          {/* Stream Error Message */}

          {error && (

            <div

              style={{

                marginTop: '16px',

                padding: '12px',

                backgroundColor: '#f443361a',

                borderRadius: '6px',

                border: '1px solid #f44336',

                display: 'flex',

                alignItems: 'center',

                gap: '8px',

              }}

            >

              <FontAwesomeIcon icon={faCircleXmark} style={{ color: '#f44336' }} />

              <div>

                <div style={{ color: '#f44336', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>

                  Stream Error

                </div>

                <div style={{ color: '#f44336', fontSize: '12px' }}>

                  {error}

                </div>

              </div>

            </div>

          )}

        </div>

 

        {/* Footer */}

        <div

          style={{

            padding: '16px 24px',

            borderTop: `1px solid ${theme.colors.border}`,

            display: 'flex',

            justifyContent: 'flex-end',

            gap: '12px',

          }}

        >

          {fileStatus && (fileStatus.status === 'error' || fileStatus.status === 'Failed') && (

            <button

              onClick={() => {

                reset();

                startMonitoring();

              }}

              style={{

                padding: '10px 24px',

                backgroundColor: '#4a90d9',

                color: 'white',

                border: 'none',

                borderRadius: '6px',

                cursor: 'pointer',

                fontSize: '14px',

                fontWeight: 'bold',

              }}

            >

              <FontAwesomeIcon icon={faRotateRight} style={{ marginRight: '8px' }} />

              Check Status Again

            </button>

          )}

         

          <button

            onClick={onClose}

            style={{

              padding: '10px 24px',

              backgroundColor: theme.colors.surface,

              color: theme.colors.text,

              border: `1px solid ${theme.colors.border}`,

              borderRadius: '6px',

              cursor: 'pointer',

              fontSize: '14px',

              fontWeight: 'bold',

            }}

          >

            Close

          </button>

        </div>

      </div>

    </>

  );

};

 

export default RetryPanel;

 

 

 

 