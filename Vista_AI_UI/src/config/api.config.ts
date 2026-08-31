
import { API_BASE_URL as ENV_API_BASE_URL } from '../sso/env';

 

/**

 * Centralized API Configuration

 *

 * This file serves as the single source of truth for all API-related configuration.

 * All services and components should import from this file instead of hardcoding URLs.

 *

 * The API base URL is automatically determined based on the current UI URL:

 * - Local: http://localhost:5173 → http://localhost:3000/

 * - Dev: https://clarity-ai-dev.EH.com → https://clarity-ai-dev.EH.com/clarity-api/

 * - SIT: https://clarity-ai-sit.EH.com → https://clarity-ai-sit.EH.com/clarity-api/

 * - UAT: https://clarity-ai-uat.EH.com → https://clarity-ai-uat.EH.com/clarity-api/

 * - Perf: https://clarity-ai-perf.EH.com → https://clarity-ai-perf.EH.com/clarity-api/

 * - Prod: https://clarity-ai.EH.com → https://clarity-ai.EH.com/clarity-api/

 *

 * Configuration is managed in: /src/sso/env.js

 */

 

const BASE_URL = ENV_API_BASE_URL || 'https://clarity-ai-dev.EH.com/clarity-api';

 

/**

 * API Configuration object

 */

export const apiConfig = {

  baseUrl: BASE_URL,

 

  endpoints: {

    // Health & Status

    health: `${BASE_URL}/health`,

 

    // Data & Files

    allData: `${BASE_URL}/v1/allData`,

 

    // Job Management

    createJob: `${BASE_URL}/v1/create`,

    jobStatus: (jobId: string) => `${BASE_URL}/v1/jobs/${jobId}/status`,

    cancelJob: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/stop`,

 

    // File Operations

    uploadFile: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobs/${jobId}/files/${fileId}/upload`,

    retryFile: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/retry`,

    deleteFile: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/delete`,

    sampleDownload: (filename: string) => `${BASE_URL}/sample-files/download/${filename}`,

 

    // Transcript Operations

    transcriptSegments: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/transcriptSegments`,

    downloadDiarized: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobs/${jobId}/files/${fileId}/download-diarized`,

    downloadRaw: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobs/${jobId}/files/${fileId}/download`,

 

    // Audio Operations

    audioChunks: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/audioChunks`,

    streamAudio: (jobId: string, fileId: string) => `${BASE_URL}/v1/jobId/${jobId}/fileId/${fileId}/streamAudio`,

 

    // Chat

    chat: `${BASE_URL}/v1/chat`,

    // Visitor Stats
    visitorCount: `${BASE_URL}/v1/visitor-count`,
    visitorCountIncrement: `${BASE_URL}/v1/visitor-count/increment`,

  }

} as const;

 

/**

 * Export the base URL for backward compatibility

 * @deprecated Use apiConfig.baseUrl instead

 */

export const API_BASE_URL = BASE_URL;

 

export default apiConfig;

 

 

 

 