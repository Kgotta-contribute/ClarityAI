import { apiConfig } from '../config/api.config';

import axiosInstance from '../utils/axiosInstance';

 

export interface AudioFile {

  jobID: string;

  fileID: string;

  fileName: string;

  sizeBytes: number;

  fileStatus: string;

  userName: string;

  domainID?: string;

  businessGroup?: string;

  status: string;

  receivedAt: string;

  sourceFileName: string;

  duration: number | null;

  startedProcessingAt?: string;

  processedAt?: string;

  fileProcessingDuration?: string;

}

 

export interface AudioFilesResponse {

  records: AudioFile[];

  pagination: {

    page: number;

    limit: number;

    total: number;

    totalPages: number;

  };

}

 

export interface HealthResponse {

  status: string;

}

 

import { mockAudioFiles } from '../data/mockAudioData';

export const getAudioFiles = async (cursor: number = 1, limit: number = 10): Promise<AudioFilesResponse> => {
  try {
    const response = await axiosInstance.get(apiConfig.endpoints.allData, {
      params: { cursor, limit }
    });

    return response.data;
  } catch {
    const records: AudioFile[] = mockAudioFiles.map((item) => ({
      jobID: item.jobId,
      fileID: item.id,
      fileName: item.fileName,
      sizeBytes: item.fileSize,
      fileStatus: item.status,
      userName: item.userName,
      domainID: item.userDomain,
      businessGroup: item.businessGroup,
      status: item.status,
      receivedAt: item.receivedDate,
      sourceFileName: item.fileName,
      duration: item.duration,
    }));

    return {
      records,
      pagination: {
        page: cursor,
        limit,
        total: records.length,
        totalPages: Math.ceil(records.length / limit) || 1,
      },
    };
  }
};

 

export const getHealthStatus = async (): Promise<HealthResponse> => {

  const response = await axiosInstance.get(apiConfig.endpoints.health);

 

  return response.data;

};

 

export const formatFileSize = (bytes: number): string => {

  if (bytes === 0) return '0 Bytes';

 

  const k = 1024;

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

 

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

};

 

export const formatDate = (isoString: string): string => {

  const date = new Date(isoString);

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

};

 

export const getStatusColor = (status: string): string => {

  switch (status.toLowerCase()) {

    case 'completed':

      return '#28a745';

    case 'processing':

      return '#ffc107';

    case 'failed':

      return '#dc3545';

    case 'pending':

      return '#6c757d';

    default:

      return '#6c757d';

  }

};

 

export const retryFailedFile = async (

  jobId: string,

  fileId: string

): Promise<{ success: boolean; message: string; status?: FileStatusResponse }> => {

  try {

    const response = await axiosInstance.post(apiConfig.endpoints.retryFile(jobId, fileId), {}, {

      headers: {

        'Content-Type': 'application/json',

      },

    });

 

    const data = response.data;

 

    return {

      success: true,

      message: data.message || 'File retry initiated successfully',

    };

  } catch (error) {

    return {

      success: false,

      message: error instanceof Error ? error.message : 'Failed to retry file processing',

    };

  }

};

 

export interface FileStatusResponse {

  fileID: string;

  fileName: string;

  status: 'pending' | 'processing' | 'completed' | 'error' | 'Failed';

  progress: {

    stage: string;

    currentChunk: number;

    totalChunks: number;

    percentage: number;

  };

  errorDetails: string | null;

}

 

export const checkFileStatusStream = async (

  jobId: string,

  fileId: string,

  onStatusUpdate?: (status: FileStatusResponse) => void,

  onError?: (error: string) => void

): Promise<{ success: boolean; status: FileStatusResponse | null; message: string }> => {

  const abortController = new AbortController();

  let lastStatus: FileStatusResponse | null = null;

 

  return new Promise((resolve) => {

    const timeout = setTimeout(() => {

      abortController.abort();

      resolve({

        success: false,

        status: lastStatus,

        message: 'Status check timed out after 60 seconds',

      });

    }, 60000);

 

    // Get auth headers for fetch (SSE doesn't work well with axios)

    import('../utils/authHeaders').then(({ getAuthHeaders }) => {

      const authHeaders = getAuthHeaders();

 

      fetch(apiConfig.endpoints.jobStatus(jobId), {

        method: 'GET',

        headers: {

          ...authHeaders,

          'Accept': 'text/event-stream',

          'Cache-Control': 'no-cache',

        },

        signal: abortController.signal,

      })

        .then(async (response) => {

          if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

          }

 

          const reader = response.body?.getReader();

          const decoder = new TextDecoder();

 

          if (!reader) {

            throw new Error('No response body');

          }

 

          try {

            while (true) {

              const { done, value } = await reader.read();

 

              if (done) {

                clearTimeout(timeout);

                abortController.abort();

                resolve({

                  success: false,

                  status: null,

                  message: 'Stream ended without receiving status',

                });

                break;

              }

 

              const chunk = decoder.decode(value, { stream: true });

 

              if (chunk.includes(': ping')) {

                continue;

              }

 

              const lines = chunk.split('\n');

              for (const line of lines) {

                if (line.startsWith('data: ')) {

                  try {

                    const jsonData = line.substring(6).trim();

                    if (!jsonData) continue;

 

                    const statusData = JSON.parse(jsonData);

 

                    if (statusData.files && Array.isArray(statusData.files)) {

                      // eslint-disable-next-line @typescript-eslint/no-explicit-any

                      const found = statusData.files.find((file: any) => file.fileID === fileId);

                      if (found) {

                        lastStatus = found;

 

                        if (onStatusUpdate) {

                          onStatusUpdate(found);

                        }

 

                        if (found.status === 'completed' || found.status === 'error' || found.status === 'Failed') {

                          clearTimeout(timeout);

                          reader.cancel();

                          abortController.abort();

                          resolve({

                            success: true,

                            status: found,

                            message: 'Status retrieved successfully',

                          });

                          return;

                        }

                      }

                    }

                  } catch {

                    // Silent fail for parse errors

                  }

                }

              }

            }

          } catch (readError) {

            if (readError instanceof Error && readError.name !== 'AbortError') {

              if (onError) {

                onError(readError instanceof Error ? readError.message : 'Error reading stream');

              }

            }

          } finally {

            reader.releaseLock();

          }

        })

        .catch((error) => {

          clearTimeout(timeout);

          if (error.name !== 'AbortError') {

            if (onError) {

              onError(error instanceof Error ? error.message : 'Failed to fetch status');

            }

            resolve({

              success: false,

              status: null,

              message: error instanceof Error ? error.message : 'Failed to fetch status',

            });

          }

        });

    });

  });

};

 

export interface AudioChunksResponse {

  jobID: string;

  fileID: string;

  fileName: string;

  totalSize: number;

  chunks: AudioChunk[];

}

 

export interface AudioChunk {

  chunkNumber: number;

  totalChunks: number;

  startByte: number;

  endByte: number;

  sizeBytes: number;

  startTime: number;

  endTime: number;

  transcriptSegments: TranscriptSegment[];

}

 

export interface TranscriptSegment {

  start: number;

  end: number;

  text: string;

  speaker: string;

}

 

export const getAudioChunks = async (jobId: string, fileId: string): Promise<AudioChunksResponse> => {

  const response = await axiosInstance.get(apiConfig.endpoints.audioChunks(jobId, fileId));

 

  const data = response.data;

 

  if (!data.chunks || !Array.isArray(data.chunks)) {

    throw new Error('Invalid chunks data format');

  }

 

  return data;

};

 

export const streamAudioChunkByRange = async (

  jobId: string,

  fileId: string,

  startByte: number,

  endByte: number

): Promise<Blob> => {

 

  const response = await axiosInstance.get(

    apiConfig.endpoints.streamAudio(jobId, fileId),

    {

      headers: {

        'Range': `bytes=${startByte}-${endByte}`

      },

      responseType: 'blob'

    }

  );

 

  return new Blob([response.data], { type: response.headers['content-type'] || 'audio/mpeg' });

};

 

export const getAudioBlob = async (audioUrl: string): Promise<Blob> => {

  const response = await axiosInstance.get(audioUrl, {

    responseType: 'blob'

  });

 

  return new Blob([response.data], { type: response.headers['content-type'] || 'audio/mpeg' });

};

 

export const downloadRawTranscript = async (jobId: string, fileId: string): Promise<{ blob: Blob; headers: any }> => {

  const response = await axiosInstance.get(

    apiConfig.endpoints.downloadRaw(jobId, fileId),

    {

      responseType: 'blob'

    }

  );

 

  const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/plain' });

  return { blob, headers: response.headers };

};

 

export const deleteAudioFile = async (

  jobId: string,

  fileId: string

): Promise<{ success: boolean; message: string }> => {

  try {

    const response = await axiosInstance.post(

      apiConfig.endpoints.deleteFile(jobId, fileId),

      {},

      {

        headers: {

          'Content-Type': 'application/json',

        },

      }

    );

 

    return {

      success: true,

      message: response.data?.message || response.data?.msg || 'Audio file deleted successfully',

    };

  } catch (error) {

    console.error('Delete audio file error:', error);

    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };

    return {

      success: false,

      message: axiosError?.response?.data?.message || axiosError?.message || 'Failed to delete audio file',

    };

  }

};


export const getVisitorCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get(apiConfig.endpoints.visitorCount);
    return response.data.visits;
  } catch (error) {
    console.error('Fetch visitor count error:', error);
    return 1024; // fallback
  }
};


export const incrementVisitorCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance.post(apiConfig.endpoints.visitorCountIncrement);
    return response.data.visits;
  } catch (error) {
    console.error('Increment visitor count error:', error);
    return 1025; // fallback
  }
};

 

const apiService = {

  getAudioFiles,

  getHealthStatus,

  formatFileSize,

  formatDate,

  getStatusColor,

  retryFailedFile,

  checkFileStatusStream,

  getAudioChunks,

  streamAudioChunkByRange,

  getAudioBlob,

  downloadRawTranscript,

  deleteAudioFile,

  getVisitorCount,

  incrementVisitorCount,

};

 

export default apiService;

 

 

 