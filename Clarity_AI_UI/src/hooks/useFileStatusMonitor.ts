
import { useState, useEffect, useRef } from 'react';

import { checkFileStatusStream, type FileStatusResponse } from '../services/apiService';

import { showToast } from '../components/Toast/ToastContainer';

 

export const useFileStatusMonitor = (

  jobId: string,

  fileId: string,

  autoStart: boolean = true

) => {

  const [fileStatus, setFileStatus] = useState<FileStatusResponse | null>(null);

  const [loading, setLoading] = useState(autoStart);

  const [error, setError] = useState<string | null>(null);

  const hasCheckedRef = useRef(false);

 

  const startMonitoring = async () => {

    if (hasCheckedRef.current) return;

    hasCheckedRef.current = true;

   

    setLoading(true);

    setError(null);

 

    try {

      await checkFileStatusStream(

        jobId,

        fileId,

        (statusUpdate: FileStatusResponse) => {

          setFileStatus(statusUpdate);

          setLoading(false);

          if ((statusUpdate.status === 'Failed' || statusUpdate.status === 'error') && statusUpdate.errorDetails) {
            showToast(`File "${statusUpdate.fileName}" processing failed: ${statusUpdate.errorDetails}`, 'error', 10000);
          }

        },

        (errorMsg: string) => {

          setError(errorMsg);

          setLoading(false);

          showToast(errorMsg, 'error');

        }

      );

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Failed to check file status';

      setError(errorMessage);

      setLoading(false);

      showToast(errorMessage, 'error');

    }

  };

 

  const reset = () => {

    hasCheckedRef.current = false;

    setFileStatus(null);

    setLoading(true);

    setError(null);

  };

 

  useEffect(() => {

    if (!autoStart || !jobId || !fileId || hasCheckedRef.current) return;

   

    hasCheckedRef.current = true;

 

    checkFileStatusStream(

      jobId,

      fileId,

      (statusUpdate: FileStatusResponse) => {

        setFileStatus(statusUpdate);

        setLoading(false);

        if ((statusUpdate.status === 'Failed' || statusUpdate.status === 'error') && statusUpdate.errorDetails) {
          showToast(`File "${statusUpdate.fileName}" processing failed: ${statusUpdate.errorDetails}`, 'error', 10000);
        }

      },

      (errorMsg: string) => {

        setError(errorMsg);

        setLoading(false);

        showToast(errorMsg, 'error');

      }

    ).catch((err) => {

      const errorMessage = err instanceof Error ? err.message : 'Failed to check file status';

      setError(errorMessage);

      setLoading(false);

      showToast(errorMessage, 'error');

    });

  }, [jobId, fileId, autoStart]);

 

  return {

    fileStatus,

    loading,

    error,

    startMonitoring,

    reset,

  };

};

 

export default useFileStatusMonitor;

 

 

 

 