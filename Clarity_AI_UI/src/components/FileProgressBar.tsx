
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {

  faXmark,

  faFile,

  faCheckCircle,

  faExclamationCircle,

  faArrowUp,

  faMicrophone,

  faCog,

  faSpinner,

  faHourglassHalf,

  faRotateRight

} from '@fortawesome/free-solid-svg-icons';

import { ProgressBar } from 'design-language';

import { useTheme } from '../hooks/useTheme';

import { useFileStatusMonitor } from '../hooks/useFileStatusMonitor';

import styles from './styles/FileProgressBar.module.css';

 

interface FileProgressBarProps {

  jobId: string;

  fileId: string;

  fileName: string;

  onClose: () => void;

}

 

const FileProgressBar: React.FC<FileProgressBarProps> = ({

  jobId,

  fileId,

  fileName,

  onClose

}) => {

  const { theme } = useTheme();

  const { fileStatus, loading, error } = useFileStatusMonitor(jobId, fileId);

 

  const getStatusIcon = () => {

    if (!fileStatus) return faFile;

   

    if (fileStatus.status === 'completed') return faCheckCircle;

    if (fileStatus.status === 'error' || fileStatus.status === 'Failed') return faExclamationCircle;

    if (fileStatus.status === 'processing') {

      if (fileStatus.progress?.stage === 'uploading') return faArrowUp;

      if (fileStatus.progress?.stage === 'transcribing') return faMicrophone;

      if (fileStatus.progress?.stage === 'processing') return faCog;

      return faSpinner;

    }

    return faFile;

  };

 

  const getStatusColor = () => {

    if (!fileStatus) return '#cdcdcd';

    if (fileStatus.status === 'completed') return '#4caf50';

    if (fileStatus.status === 'processing') return '#2196f3';

    if (fileStatus.status === 'error' || fileStatus.status === 'Failed') return '#f44336';

    return '#cdcdcd';

  };

 

  const getCurrentProgress = () => {

    if (!fileStatus?.progress?.percentage) return 0;

    return Math.round(fileStatus.progress.percentage);

  };

 

  return (

    <>

      <div className={styles.backdrop} onClick={onClose} />

      <div

        className={styles.modal}

        style={{

          backgroundColor: theme.colors.background,

          border: `2px solid ${getStatusColor()}`,

        }}

      >

      <div

        className={styles.header}

        style={{

          borderBottom: `1px solid ${theme.colors.border}`,

          backgroundColor: theme.colors.surface,

        }}

      >

        <div className={styles.headerLeft}>

          <FontAwesomeIcon icon={getStatusIcon()} style={{ color: getStatusColor() }} />

          <h4 className={styles.headerTitle} style={{ color: theme.colors.text }}>

            Processing Progress

          </h4>

        </div>

        <button

          onClick={onClose}

          className={styles.closeButton}

          style={{ color: theme.colors.textSecondary }}

        >

          <FontAwesomeIcon icon={faXmark} />

        </button>

      </div>

 

      <div className={styles.body}>

        <div className={styles.fileNameSection}>

          <div className={styles.fileNameLabel} style={{ color: theme.colors.textSecondary }}>

            File Name

          </div>

          <div className={styles.fileName} style={{ color: theme.colors.text }}>

            {fileName}

          </div>

        </div>

 

        {loading && !fileStatus && (

          <div className={styles.loadingContainer}>

            <FontAwesomeIcon icon={faHourglassHalf} size="2x" className={styles.loadingIcon} style={{ color: theme.colors.textSecondary }} />

            <div className={styles.loadingText} style={{ color: theme.colors.textSecondary }}>

              Loading progress...

            </div>

          </div>

        )}

 

        {error && (

          <div className={styles.errorBox}>

            <div className={styles.errorText}>

              {error}

            </div>

          </div>

        )}

 

        {fileStatus && (

          <>

            <div className={styles.statusText}>

              <span className={styles.statusLabel} style={{ color: theme.colors.textSecondary }}>

                Status: <strong style={{ color: getStatusColor() }}>{fileStatus.status}</strong>

                {fileStatus.progress?.stage && ` - ${fileStatus.progress.stage}`}

              </span>

            </div>

 

            <div className={styles.progressBarContainer}>

              <ProgressBar

                percent={getCurrentProgress()}

                lightColor1={getStatusColor()}

                lightColor2={getStatusColor()}

                darkColor1={getStatusColor()}

                darkColor2={getStatusColor()}

                width="100%"

              />

            </div>

 

            {fileStatus.progress && (

              <div

                className={styles.progressDetails}

                style={{

                  color: theme.colors.textSecondary,

                  backgroundColor: theme.colors.surface,

                }}

              >

                <span>

                  <strong>Stage:</strong> {fileStatus.progress.stage || 'processing'}

                </span>

                <span>

                  <strong>Chunks:</strong> {fileStatus.progress.currentChunk || 0}/{fileStatus.progress.totalChunks || 1}

                </span>

              </div>

            )}

 

            {fileStatus.errorDetails && (

              <div className={styles.errorDetailsBox}>

                <div className={styles.errorDetailsTitle}>

                  Error Details

                </div>

                <div className={styles.errorDetailsText}>

                  {fileStatus.errorDetails}

                </div>

              </div>

            )}

 

            {(fileStatus.status === 'error' || fileStatus.status === 'Failed') && (

              <button disabled={true} className={styles.retryButton}>

                <FontAwesomeIcon icon={faRotateRight} />

                Retry Processing

              </button>

            )}

 

            {fileStatus.status === 'completed' && (

              <div className={styles.successBox}>

                <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} />

                <div className={styles.successText}>

                  Processing Completed Successfully!

                </div>

              </div>

            )}

          </>

        )}

      </div>

      </div>

    </>

  );

};

 

export default FileProgressBar;

 

 

 